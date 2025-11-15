import { FetchOlxEvent, ProductFetchedEvent } from "@core/events";
import { ListingPayload } from "@core/types";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

import {
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  sleep,
} from "../../domain/types/common.types";
import {
  OlxConfig,
  OlxGraphQLQuery,
  OlxGraphQLResponse,
  OlxPriceParameter,
  OlxRequestHeaders,
} from "../../domain/types/olx.types";

@Controller()
export class FetchOlxHandler {
  private readonly logger = new Logger(FetchOlxHandler.name);

  private readonly config: OlxConfig;

  constructor(
    @Inject("PRODUCT_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      apiUrl:
        this.configService.get<string>("OLX_API_URL") ??
        "https://www.olx.pl/apigateway/graphql",
      maxRetries: Number.parseInt(
        this.configService.get<string>("OLX_MAX_RETRIES") ?? "4",
      ),
    };
  }

  @EventPattern(FetchOlxEvent.name)
  async handle(event: FetchOlxEvent): Promise<void> {
    this.logger.log(
      `Handling OLX fetch for query: ${event.query}, minPrice: ${String(event.minPrice)}, maxPrice: ${String(event.maxPrice)}`,
    );

    try {
      const listings = await this.fetchOlxProducts(event);

      const productFetchedEvent = new ProductFetchedEvent(
        listings,
        event.chatId,
        "olx",
        true,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error fetching OLX products: ${errorMessage}`);

      const productFetchedEvent = new ProductFetchedEvent(
        [],
        event.chatId,
        "olx",
        false,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    }
  }

  private createGraphQLQuery(
    query: string,
    limit: number,
    offset: number,
    minPrice?: number | null,
    maxPrice?: number | null,
  ): OlxGraphQLQuery {
    const searchParameters: Array<{ key: string; value: string }> = [
      { key: "offset", value: String(offset) },
      { key: "limit", value: String(limit) },
      { key: "query", value: query },
      { key: "filter_refiners", value: "spell_checker" },
      { key: "suggest_filters", value: "true" },
    ];

    // Add price filters if provided
    if (minPrice !== undefined && minPrice !== null) {
      searchParameters.push({
        key: "filter_float_price:from",
        value: String(minPrice),
      });
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      searchParameters.push({
        key: "filter_float_price:to",
        value: String(maxPrice),
      });
    }

    return {
      query: `
        query ListingSearchQuery($searchParameters: [SearchParameter!] = { key: "", value: "" }) {
          clientCompatibleListings(searchParameters: $searchParameters) {
            __typename
            ... on ListingSuccess {
              data {
                title
                url
                description
                photos { link }
                params {
                  key
                  value {
                    __typename
                    ... on PriceParam {
                      value
                      label
                      currency
                      negotiable
                    }
                  }
                }
              }
            }
            ... on ListingError {
              error { code title status detail }
            }
          }
        }
      `,
      variables: {
        searchParameters,
      },
    };
  }

  private createHeaders(
    clientHeaders?: Record<string, string>,
  ): OlxRequestHeaders {
    const baseHeaders = {
      "content-type": "application/json",
      accept: "application/json",
      origin: "https://www.olx.pl",
      referer: "https://www.olx.pl/",
      "x-client": "DESKTOP",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const fwd = clientHeaders ?? {};
    return {
      ...baseHeaders,
      ...(fwd["user-agent"] ? { "user-agent": fwd["user-agent"] } : {}),
      ...(fwd["accept-language"]
        ? { "accept-language": fwd["accept-language"] }
        : {}),
      ...(fwd.cookie ? { cookie: fwd.cookie } : {}),
    };
  }

  private async performOlxSearch(
    graphqlQuery: OlxGraphQLQuery,
    headers: OlxRequestHeaders,
  ): Promise<OlxGraphQLResponse> {
    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers,
      redirect: "manual",
      referrer: "https://www.olx.pl/",
      referrerPolicy: "strict-origin-when-cross-origin",
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `OLX API error: ${response.status.toString()} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");
      const snippet = text.slice(0, 300) + (text.length > 300 ? "…" : "");
      this.logger.warn(
        `OLX 2xx but non-JSON content-type (${contentType}). Body[0..300]: ${snippet}`,
      );
      throw new Error("Unexpected OLX response structure");
    }

    let json: OlxGraphQLResponse = {};
    try {
      const parsed: unknown = await response.json();
      if (typeof parsed === "object" && parsed !== null) {
        json = parsed as OlxGraphQLResponse;
      }
    } catch {
      throw new Error("Failed to parse OLX response JSON");
    }

    return json;
  }

  private processOlxResponse(json: OlxGraphQLResponse): ListingPayload[] {
    const payload =
      json.data?.clientCompatibleListings ?? json.clientCompatibleListings;

    if (payload == null) {
      throw new Error("OLX response missing listing payload");
    }

    if (payload.__typename === "ListingError") {
      const error = payload.error;
      throw new Error(
        `OLX API error: ${error?.title ?? "Unknown"} (${error?.code ?? "N/A"}) - ${error?.detail ?? "No details"}`,
      );
    }

    const items = payload.data ?? [];

    return items
      .filter((item): item is NonNullable<typeof item> => item != null)
      .map((item) => {
        const priceParameter = item.params?.find(
          (parameter) => parameter?.key === "price",
        )?.value;
        const isPriceParameter =
          priceParameter != null &&
          typeof priceParameter === "object" &&
          "__typename" in priceParameter &&
          priceParameter.__typename === "PriceParam";

        const validPriceParameter = isPriceParameter
          ? (priceParameter as OlxPriceParameter)
          : null;

        return {
          image: (() => {
            const link = item.photos?.[0]?.link;
            if (typeof link === "string" && link.length > 0) {
              return link.replace(/;s=.*$/, "");
            }
            return null;
          })(),
          title: item.title ?? "",
          description: item.description ?? item.title ?? "",
          link: item.url ?? "",
          price: {
            value: validPriceParameter?.value ?? null,
            label: validPriceParameter?.label ?? null,
            currency: validPriceParameter?.currency ?? "PLN",
            negotiable: validPriceParameter?.negotiable ?? false,
          },
          category: undefined,
          provider: "olx",
        } satisfies ListingPayload;
      });
  }

  private async fetchOlxProducts(
    event: FetchOlxEvent,
  ): Promise<ListingPayload[]> {
    const { query, limit, offset, minPrice, maxPrice } = event;
    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching OLX for "${query}" (limit=${limit.toString()}, offset=${offset.toString()}, minPrice=${String(minPrice)}, maxPrice=${String(maxPrice)}), attempt ${attempt.toString()}`,
        );

        const graphqlQuery = this.createGraphQLQuery(
          query,
          limit,
          offset,
          minPrice,
          maxPrice,
        );
        const headers = this.createHeaders();
        const json = await this.performOlxSearch(graphqlQuery, headers);
        const listings = this.processOlxResponse(json);

        this.logger.log(
          `Fetched ${listings.length.toString()} OLX listings for query="${query}" (limit=${limit.toString()}, offset=${offset.toString()})`,
        );

        return listings;
      } catch (error: unknown) {
        if (attempt < this.config.maxRetries && isRetryableError(error)) {
          const delayMs = calculateRetryDelay(attempt, {
            ...DEFAULT_RETRY_CONFIG,
            baseDelayMs: 500,
            jitterMs: 300,
          });

          this.logger.warn(
            `OLX error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${error instanceof Error ? error.message : "Unknown error"}`,
          );

          await sleep(delayMs);
          continue;
        }

        this.logger.error(
          `OLX search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw error;
      }
    }
  }
}
