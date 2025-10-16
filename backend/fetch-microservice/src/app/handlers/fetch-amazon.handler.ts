import { FetchAmazonEvent, ProductFetchedEvent } from "@core/events";
import { ListingPayload } from "@core/types";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

import {
  AmazonApiResponse,
  AmazonConfig,
  AmazonSearchParameters,
} from "../../domain/types/amazon.types";
import {
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  sleep,
} from "../../domain/types/common.types";

@Controller()
export class FetchAmazonHandler {
  private readonly logger = new Logger(FetchAmazonHandler.name);

  private readonly config: AmazonConfig;

  constructor(
    @Inject("PRODUCT_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      rapidApiKey: this.configService.get<string>("RAPIDAPI_KEY") ?? "",
      apiUrl:
        this.configService.get<string>("AMAZON_API_URL") ??
        "https://real-time-amazon-data.p.rapidapi.com/search",
      apiHost:
        this.configService.get<string>("AMAZON_API_HOST") ??
        "real-time-amazon-data.p.rapidapi.com",
      defaultCountry: this.configService.get<string>("AMAZON_COUNTRY") ?? "PL",
      maxRetries: Number.parseInt(
        this.configService.get<string>("AMAZON_MAX_RETRIES") ?? "3",
      ),
    };
  }

  @EventPattern(FetchAmazonEvent.name)
  async handle(event: FetchAmazonEvent): Promise<void> {
    this.logger.log(`Handling Amazon fetch for query: ${event.query}`);

    try {
      const listings = await this.fetchAmazonProducts(event);

      const productFetchedEvent = new ProductFetchedEvent(
        listings,
        event.chatId,
        "amazon",
        true,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error fetching Amazon products: ${errorMessage}`);

      const productFetchedEvent = new ProductFetchedEvent(
        [],
        event.chatId,
        "amazon",
        false,
        event.eventId,
        event.totalEvents,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    }
  }

  private async searchAmazonProducts(
    searchParameters_: AmazonSearchParameters,
  ): Promise<AmazonApiResponse> {
    const searchParameters = new URLSearchParams({
      query: searchParameters_.query,
      country: searchParameters_.country,
      page: searchParameters_.page,
    });

    const searchUrl = `${this.config.apiUrl}?${searchParameters.toString()}`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": this.config.rapidApiKey,
        "X-RapidAPI-Host": this.config.apiHost,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Amazon API request failed: ${response.status.toString()} ${response.statusText} - ${text}`,
      );
    }

    return (await response.json()) as AmazonApiResponse;
  }

  private async fetchAmazonProducts(
    event: FetchAmazonEvent,
  ): Promise<ListingPayload[]> {
    const { query, limit, offset, country, page } = event;
    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching Amazon for "${query}" (country=${country}, page=${page.toString()}), attempt ${attempt.toString()}`,
        );

        const data = await this.searchAmazonProducts({
          query,
          country: country || this.config.defaultCountry,
          page: page.toString(),
        });

        if (data.status !== "OK" || data.data?.products == null) {
          this.logger.warn(`Amazon API returned non-OK status: ${data.status}`);
          return [];
        }

        const items = data.data.products ?? [];
        const paginatedItems = items.slice(offset, offset + limit);

        const listings: ListingPayload[] = paginatedItems.map((item) => {
          return {
            image: item.product_photo ?? null,
            title: item.product_title ?? "",
            description: item.product_title ?? "",
            link: item.product_url ?? "",
            price: {
              value: null,
              label: item.product_price ?? item.product_original_price ?? null,
              currency: item.currency ?? "PLN",
              negotiable: false,
            },
          } as ListingPayload;
        });

        this.logger.log(
          `Fetched ${listings.length.toString()} Amazon listings for query="${query}" (limit=${limit.toString()}, offset=${offset.toString()})`,
        );

        return listings;
      } catch (error: unknown) {
        if (attempt < this.config.maxRetries && isRetryableError(error)) {
          const delayMs = calculateRetryDelay(attempt, DEFAULT_RETRY_CONFIG);

          this.logger.warn(
            `Amazon error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${error instanceof Error ? error.message : "Unknown error"}`,
          );

          await sleep(delayMs);
          continue;
        }

        this.logger.error(
          `Amazon search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw error;
      }
    }
  }
}
