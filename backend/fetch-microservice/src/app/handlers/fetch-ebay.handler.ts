import { FetchEbayEvent, ProductFetchedEvent } from "@core/events";
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
  EbayCachedToken,
  EbayConfig,
  EbayRequestHeaders,
  EbaySearchParameters,
  EbaySearchResponse,
  EbayTokenRequestHeaders,
  EbayTokenResponse,
} from "../../domain/types/ebay.types";

@Controller()
export class FetchEbayHandler {
  private readonly logger = new Logger(FetchEbayHandler.name);

  private readonly config: EbayConfig;
  private cachedToken: EbayCachedToken | null = null;

  constructor(
    @Inject("PRODUCT_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      clientId: this.configService.get<string>("EBAY_CLIENT_ID") ?? "",
      clientSecret: this.configService.get<string>("EBAY_CLIENT_SECRET") ?? "",
      tokenUrl: this.configService.get<string>("EBAY_TOKEN_URL") ?? "",
      searchUrl: this.configService.get<string>("EBAY_SEARCH_URL") ?? "",
      oauthScope: this.configService.get<string>("EBAY_OAUTH_SCOPE") ?? "",
      marketplaceId:
        this.configService.get<string>("EBAY_MARKETPLACE_ID") ?? "EBAY_PL",
      maxRetries: Number.parseInt(
        this.configService.get<string>("EBAY_MAX_RETRIES") ?? "3",
      ),
      tokenBufferSeconds: Number.parseInt(
        this.configService.get<string>("EBAY_TOKEN_BUFFER_SECONDS") ?? "300",
      ),
    };
  }

  @EventPattern(FetchEbayEvent.name)
  async handle(event: FetchEbayEvent): Promise<void> {
    this.logger.log(
      `Handling eBay fetch for query: ${event.query}, minPrice: ${String(event.minPrice)}, maxPrice: ${String(event.maxPrice)}`,
    );

    try {
      const listings = await this.fetchEbayProducts(event);

      const productFetchedEvent = new ProductFetchedEvent(
        listings,
        event.chatId,
        "ebay",
        true,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error fetching eBay products: ${errorMessage}`);

      const productFetchedEvent = new ProductFetchedEvent(
        [],
        event.chatId,
        "ebay",
        false,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    }
  }

  private async getAppAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken != null && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    const basicAuth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: this.config.oauthScope,
    });

    const headers: EbayTokenRequestHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    };

    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      this.logger.error(
        `eBay token request failed: ${response.status.toString()} ${errorText}`,
      );
      throw new Error(
        `Failed to get eBay access token: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as EbayTokenResponse;

    // Cache the token (eBay tokens typically last 2 hours, cache for 1.5 hours to be safe)
    this.cachedToken = {
      token: data.access_token,
      expiresAt:
        Date.now() + (data.expires_in - this.config.tokenBufferSeconds) * 1000,
    };

    return data.access_token;
  }

  private createSearchParameters(
    query: string,
    limit: number,
    offset: number,
    minPrice?: number | null,
    maxPrice?: number | null,
  ): EbaySearchParameters {
    const parameters: EbaySearchParameters = {
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    };

    // Build price filter if min or max price is provided
    // eBay filter format: price:[minPrice..maxPrice],priceCurrency:PLN
    if (
      minPrice !== undefined &&
      minPrice !== null &&
      maxPrice !== undefined &&
      maxPrice !== null
    ) {
      parameters.filter = `price:[${String(minPrice)}..${String(maxPrice)}],priceCurrency:PLN`;
    } else if (minPrice !== undefined && minPrice !== null) {
      parameters.filter = `price:[${String(minPrice)}..],priceCurrency:PLN`;
    } else if (maxPrice !== undefined && maxPrice !== null) {
      parameters.filter = `price:[..${String(maxPrice)}],priceCurrency:PLN`;
    }

    return parameters;
  }

  private createRequestHeaders(token: string): EbayRequestHeaders {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": this.config.marketplaceId,
    };
  }

  private async performEbaySearch(
    searchParameters: EbaySearchParameters,
    headers: EbayRequestHeaders,
  ): Promise<EbaySearchResponse> {
    // Filter out undefined values for URLSearchParams
    const cleanParameters: Record<string, string> = Object.fromEntries(
      Object.entries(searchParameters).filter(
        ([, value]) => value !== undefined,
      ) as [string, string][],
    );

    const searchUrl = `${this.config.searchUrl}?${new URLSearchParams(cleanParameters).toString()}`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Handle rate limiting and server errors
      if ([429, 500, 502, 503, 504].includes(response.status)) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `eBay API error ${response.status.toString()}: ${errorText}`,
        );
      }

      // Handle 401 (token expired)
      if (response.status === 401) {
        throw new Error("eBay token expired");
      }

      // For other errors, throw immediately
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `eBay API error ${response.status.toString()}: ${errorText}`,
      );
    }

    return response.json() as Promise<EbaySearchResponse>;
  }

  private processEbayResponse(data: EbaySearchResponse): ListingPayload[] {
    const items = data.itemSummaries ?? [];

    return items
      .filter((item): item is NonNullable<typeof item> => item != null)
      .map((item) => {
        // Get the first image or null
        const image =
          item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? null;

        // Extract price information
        const priceInfo = item.price ?? {};
        const priceValue =
          priceInfo.value == null ? null : Number.parseFloat(priceInfo.value);

        return {
          image,
          title: item.title ?? "",
          description: item.shortDescription ?? item.title ?? "",
          link: item.itemWebUrl ?? item.itemHref ?? "",
          price: {
            value: priceValue,
            label:
              priceInfo.value == null
                ? null
                : `${priceInfo.value} ${priceInfo.currency ?? ""}`,
            currency: priceInfo.currency ?? null,
            negotiable: false, // eBay prices are typically fixed
          },
          category: undefined,
          provider: "ebay",
        } satisfies ListingPayload;
      });
  }

  private async fetchEbayProducts(
    event: FetchEbayEvent,
  ): Promise<ListingPayload[]> {
    const { query, limit, offset, minPrice, maxPrice } = event;
    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching eBay for "${query}" (limit=${limit.toString()}, offset=${offset.toString()}, minPrice=${String(minPrice)}, maxPrice=${String(maxPrice)}), attempt ${attempt.toString()}`,
        );

        // Get access token
        const token = await this.getAppAccessToken();

        // Build search parameters
        const searchParameters = this.createSearchParameters(
          query,
          limit,
          offset,
          minPrice,
          maxPrice,
        );
        const headers = this.createRequestHeaders(token);

        // Perform search
        const data = await this.performEbaySearch(searchParameters, headers);
        const listings = this.processEbayResponse(data);

        this.logger.log(
          `Fetched ${listings.length.toString()} eBay listings for query="${query}" (limit=${limit.toString()}, offset=${offset.toString()})`,
        );

        return listings;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Handle token expiration by clearing cache and retrying once
        if (errorMessage.includes("token expired") && attempt === 1) {
          this.logger.warn("eBay token expired, clearing cache and retrying");
          this.cachedToken = null;
          continue;
        }

        // Handle retryable errors
        if (attempt <= this.config.maxRetries && isRetryableError(error)) {
          const retryDelay = calculateRetryDelay(attempt, DEFAULT_RETRY_CONFIG);
          this.logger.warn(
            `eBay network error, retry #${attempt.toString()} in ${retryDelay.toString()}ms: ${errorMessage}`,
          );
          await sleep(retryDelay);
          continue;
        }

        this.logger.error(
          `eBay search failed after ${attempt.toString()} attempts: ${errorMessage}`,
        );
        throw error;
      }
    }
  }
}
