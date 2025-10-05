// application/handlers/fetch-olx.handler.ts
import { ListingDto } from "src/domain/models/listing.dto";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { FetchOlxQuery } from "../../domain/queries/fetch-olx.query";

type ClientHeaders = Partial<Record<string, string>>;

interface OlxPriceParameter {
  __typename?: "PriceParam";
  value?: number | null;
  label?: string | null;
  currency?: string | null;
  negotiable?: boolean | null;
  [key: string]: unknown;
}

interface OlxListingParameter {
  key?: string | null;
  value?: OlxPriceParameter | Record<string, unknown> | null;
}

interface OlxListingItem {
  title?: string | null;
  url?: string | null;
  description?: string | null;
  photos?: ({ link?: string | null } | null)[] | null;
  params?: (OlxListingParameter | null | undefined)[] | null;
}

interface OlxListingSuccess {
  __typename: "ListingSuccess";
  data?: (OlxListingItem | null | undefined)[] | null;
}

interface OlxListingError {
  __typename: "ListingError";
  error?: {
    code?: string | null;
    title?: string | null;
    status?: string | number | null;
    detail?: string | null;
  } | null;
}

type OlxListingPayload = OlxListingSuccess | OlxListingError | null | undefined;

interface OlxGraphQLError {
  message?: string | null;
  extensions?: {
    code?: string | null;
  } | null;
}

interface OlxGraphQLResponse {
  data?: {
    clientCompatibleListings?: OlxListingPayload;
  } | null;
  clientCompatibleListings?: OlxListingPayload;
  errors?: (OlxGraphQLError | null | undefined)[] | null;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@QueryHandler(FetchOlxQuery)
export class FetchOlxHandler
  implements IQueryHandler<FetchOlxQuery, ListingDto[]>
{
  private readonly logger = new Logger(FetchOlxHandler.name);

  async execute(queryTemporary: FetchOlxQuery): Promise<ListingDto[]> {
    const { query, limit, offset, clientHeaders } =
      queryTemporary as FetchOlxQuery & {
        clientHeaders?: ClientHeaders;
      };

    const graphqlBody = {
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
        searchParameters: [
          { key: "offset", value: String(offset) },
          { key: "limit", value: String(limit) },
          { key: "query", value: query },
          { key: "filter_refiners", value: "spell_checker" },
          { key: "suggest_filters", value: "true" },
        ],
      },
    };

    const baseHeaders: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
      origin: "https://www.olx.pl",
      referer: "https://www.olx.pl/",
      "x-client": "DESKTOP",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const fwd = (clientHeaders ?? {}) as Record<string, string>;
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...(fwd["user-agent"] ? { "user-agent": fwd["user-agent"] } : {}),
      ...(fwd["accept-language"]
        ? { "accept-language": fwd["accept-language"] }
        : {}),
      ...(fwd.cookie ? { cookie: fwd.cookie } : {}),
    };

    const maxRetries = 4;
    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      let response: Response;
      try {
        response = await fetch("https://www.olx.pl/apigateway/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlBody),
          headers,
          redirect: "manual",
          referrer: "https://www.olx.pl/",
          referrerPolicy: "strict-origin-when-cross-origin",
        });
      } catch (error) {
        if (attempt <= maxRetries) {
          const base = Math.min(4000, 500 * 2 ** (attempt - 1));
          const jitter = Math.floor(Math.random() * 300);
          const delayMs = base + jitter;
          this.logger.warn(
            `OLX transport error, retry #${attempt.toString()} in ${delayMs.toString()}ms`,
          );
          await sleep(delayMs);
          continue;
        }
        throw error;
      }

      const status = response.status;

      if (status >= 200 && status < 300) {
        const ctype = response.headers.get("content-type") ?? "";
        if (!ctype.includes("application/json")) {
          const text = await response.text().catch(() => "");
          const snippet = text.slice(0, 300) + (text.length > 300 ? "…" : "");
          this.logger.warn(
            `OLX 2xx but non-JSON content-type (${ctype}). Body[0..300]: ${snippet}`,
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
          json = {};
        }

        const payload =
          json.data?.clientCompatibleListings ??
          json.clientCompatibleListings ??
          null;

        if (Array.isArray(json.errors) && json.errors.length > 0) {
          const [firstError] = json.errors;
          if (firstError !== null && firstError !== undefined) {
            const gqlMessage =
              typeof firstError.message === "string"
                ? firstError.message.trim()
                : "";
            const message =
              gqlMessage.length > 0
                ? gqlMessage
                : `GraphQL error (${firstError.extensions?.code ?? "UNKNOWN"})`;
            throw new Error(message);
          }
          throw new Error("GraphQL error");
        }

        if (payload === null || typeof payload !== "object") {
          const keys = Object.keys(json);
          const dataKeys = Object.keys(json.data ?? {});
          this.logger.error(
            `Unexpected OLX response: topKeys=${JSON.stringify(
              keys,
            )}, dataKeys=${JSON.stringify(dataKeys)}`,
          );
          throw new Error("Unexpected OLX response structure");
        }

        if (payload.__typename !== "ListingSuccess") {
          const error = payload.error;
          const errorParts: string[] = [];
          if (
            typeof error?.status === "number" ||
            typeof error?.status === "string"
          ) {
            errorParts.push(String(error.status));
          }
          if (typeof error?.code === "string" && error.code.trim().length > 0) {
            errorParts.push(error.code.trim());
          }
          if (
            typeof error?.title === "string" &&
            error.title.trim().length > 0
          ) {
            errorParts.push(error.title.trim());
          }
          if (
            typeof error?.detail === "string" &&
            error.detail.trim().length > 0
          ) {
            errorParts.push(error.detail.trim());
          }
          const message =
            errorParts.length > 0
              ? `OLX error: ${errorParts.join(" ")}`
              : "OLX ListingError";
          throw new Error(message);
        }

        const items = Array.isArray(payload.data) ? payload.data : [];

        const listings: ListingDto[] = items.map((item) => {
          const raw = item?.photos?.[0]?.link ?? null;
          const image =
            typeof raw === "string"
              ? raw.replace("{width}", "1200").replace("{height}", "800")
              : null;

          const priceParameter = (item?.params ?? []).find(
            (parameter): parameter is OlxListingParameter =>
              parameter !== null &&
              parameter !== undefined &&
              parameter.key === "price",
          );
          const valueCandidate = priceParameter?.value;
          let priceValue: OlxPriceParameter | null = null;
          if (
            valueCandidate !== null &&
            valueCandidate !== undefined &&
            typeof valueCandidate === "object"
          ) {
            priceValue = valueCandidate as OlxPriceParameter;
          }

          return {
            image,
            title: item?.title ?? "",
            description: item?.description ?? "",
            link: item?.url ?? "",
            price: {
              value:
                typeof priceValue?.value === "number" ? priceValue.value : null,
              label: priceValue?.label ?? null,
              currency: priceValue?.currency ?? null,
              negotiable:
                typeof priceValue?.negotiable === "boolean"
                  ? priceValue.negotiable
                  : null,
            },
          } as ListingDto;
        });

        this.logger.log(
          `Fetched ${String(listings.length)} OLX listings for query="${query}" (limit=${String(limit)}, offset=${String(offset)})`,
        );
        return listings;
      }

      if ([403, 429].includes(status) || status >= 500) {
        let bodySnippet = "";
        try {
          const text = await response.text();
          bodySnippet = text.slice(0, 300) + (text.length > 300 ? "…" : "");
        } catch {
          bodySnippet = "<no-body>";
        }
        this.logger.warn(
          `OLX non-2xx (${String(status)}). Body[0..300]: ${bodySnippet}`,
        );

        if (attempt <= maxRetries) {
          const base = Math.min(4000, 500 * 2 ** (attempt - 1));
          const jitter = Math.floor(Math.random() * 300);
          const delayMs = base + jitter;
          this.logger.warn(
            `OLX retry #${String(attempt)} in ${String(delayMs)}ms (anti-bot/throttle)`,
          );
          await sleep(delayMs);
          continue;
        }
      }

      throw new Error(`HTTP_${String(status)}`);
    }
  }
}
