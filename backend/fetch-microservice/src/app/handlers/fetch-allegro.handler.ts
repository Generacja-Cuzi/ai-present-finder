import { Controller, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

import { FetchAllegroEvent } from "../../domain/events/fetch-allegro.event";
import { ProductFetchedEvent } from "../../domain/events/product-fetched.event";
import { ListingDto } from "../../domain/models/listing.dto";
import {
  AllegroConfig,
  AllegroSearchOptions,
  AllegroSearchResponse,
  AllegroTokenCache,
  AllegroTokenResponse,
} from "../types/allegro.types";
import {
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableError,
  sleep,
} from "../types/common.types";

@Controller()
export class FetchAllegroHandler {
  private readonly logger = new Logger(FetchAllegroHandler.name);

  private readonly config: AllegroConfig;
  private tokenCache: AllegroTokenCache | null = null;

  constructor(
    @Inject("PRODUCT_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      clientId:
        this.configService.get<string>("ALLEGRO_CLIENT_ID") ??
        "36fc4e49b99e4152874b49ab463e7b64",
      clientSecret:
        this.configService.get<string>("ALLEGRO_CLIENT_SECRET") ??
        "keh75yd5gmEBZJWk7S7LfRtVhYyOvoxlSoLBINIcmynBOxpiDVdDEyU2eTD5EiBi",
      tokenUrl:
        this.configService.get<string>("ALLEGRO_TOKEN_URL") ??
        "https://allegro.pl.allegrosandbox.pl/auth/oauth/token",
      searchUrl:
        this.configService.get<string>("ALLEGRO_SEARCH_URL") ??
        "https://api.allegro.pl.allegrosandbox.pl/offers/listing",
      baseOfferUrl:
        this.configService.get<string>("ALLEGRO_BASE_OFFER_URL") ??
        "https://allegro.pl.allegrosandbox.pl/oferta",
      maxRetries: Number.parseInt(
        this.configService.get<string>("ALLEGRO_MAX_RETRIES") ?? "3",
      ),
    };
  }

  @EventPattern(FetchAllegroEvent.name)
  async handle(event: FetchAllegroEvent): Promise<void> {
    this.logger.log(`Handling Allegro fetch for query: ${event.query}`);

    try {
      const listings = await this.fetchAllegroProducts(event);

      const productFetchedEvent = new ProductFetchedEvent(
        listings,
        event.requestId,
        event.chatId,
        "allegro",
        true,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error fetching Allegro products: ${errorMessage}`);

      const productFetchedEvent = new ProductFetchedEvent(
        [],
        event.requestId,
        event.chatId,
        "allegro",
        false,
        errorMessage,
      );

      this.eventBus.emit(ProductFetchedEvent.name, productFetchedEvent);
    }
  }

  private async getAppToken(): Promise<string> {
    if (this.tokenCache != null && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const basic = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Allegro token request failed: ${response.status.toString()} ${response.statusText} - ${text}`,
      );
    }

    const json = (await response.json()) as AllegroTokenResponse;

    this.tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    };

    return json.access_token;
  }

  private async searchOffers(
    phrase: string,
    options: AllegroSearchOptions = {},
  ): Promise<AllegroSearchResponse> {
    if (!phrase) {
      throw new Error("Musisz podać parametr phrase");
    }

    const token = await this.getAppToken();

    const parameters = new URLSearchParams();
    parameters.set("phrase", phrase);
    if (options.offset != null) {
      parameters.set("offset", String(options.offset));
    }
    if (options.limit != null) {
      parameters.set("limit", String(options.limit));
    }

    const url = `${this.config.searchUrl}?${parameters.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.allegro.public.v1+json",
        "Accept-Language": "pl-PL",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Allegro search request failed: ${response.status.toString()} ${response.statusText} - ${text}`,
      );
    }

    return (await response.json()) as AllegroSearchResponse;
  }

  private parsePrice(priceString: string): number | null {
    if (!priceString) {
      return null;
    }

    const cleanPrice = priceString.replaceAll(/[^\d.,]/g, "");

    if (!cleanPrice) {
      return null;
    }

    if (cleanPrice.includes(",") && cleanPrice.includes(".")) {
      const parsed = cleanPrice.replaceAll(".", "").replaceAll(",", ".");
      return Number.parseFloat(parsed);
    } else if (cleanPrice.includes(",")) {
      const parts = cleanPrice.split(",");
      return parts.length === 2 && parts[1].length <= 2
        ? Number.parseFloat(cleanPrice.replace(",", "."))
        : Number.parseFloat(cleanPrice.replaceAll(",", ""));
    } else {
      return Number.parseFloat(cleanPrice);
    }
  }

  private async fetchAllegroProducts(
    event: FetchAllegroEvent,
  ): Promise<ListingDto[]> {
    const { query, limit, offset } = event;
    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching Allegro for "${query}" (limit=${limit.toString()}, offset=${offset.toString()}), attempt ${attempt.toString()}`,
        );

        const results = await this.searchOffers(query, { limit, offset });

        const offers = [
          ...(results.items?.promoted ?? []),
          ...(results.items?.regular ?? []),
        ];

        const listings: ListingDto[] = offers.map((offer) => {
          const priceAmount = offer.sellingMode?.price?.amount;
          const priceCurrency = offer.sellingMode?.price?.currency ?? "PLN";

          return {
            image: offer.images?.[0]?.url ?? null,
            title: offer.name || "",
            description: offer.name || "",
            link: `${this.config.baseOfferUrl}/${offer.id}`,
            price: {
              value: priceAmount == null ? null : this.parsePrice(priceAmount),
              label:
                priceAmount == null ? null : `${priceAmount} ${priceCurrency}`,
              currency: priceCurrency,
              negotiable: false,
            },
          } as ListingDto;
        });

        this.logger.log(
          `Fetched ${listings.length.toString()} Allegro listings for query="${query}" (limit=${limit.toString()}, offset=${offset.toString()})`,
        );

        return listings;
      } catch (error: unknown) {
        if (attempt < this.config.maxRetries && isRetryableError(error)) {
          const delayMs = calculateRetryDelay(attempt, DEFAULT_RETRY_CONFIG);

          this.logger.warn(
            `Allegro error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${error instanceof Error ? error.message : "Unknown error"}`,
          );

          await sleep(delayMs);
          continue;
        }

        if (error instanceof Error) {
          if (error.message.includes("401") || error.message.includes("403")) {
            this.logger.error(
              `Allegro API authentication error: ${error.message}. Check ALLEGRO_CLIENT_ID and ALLEGRO_CLIENT_SECRET.`,
            );

            this.tokenCache = null;

            throw new Error(
              `Allegro API authentication failed: ${error.message}`,
            );
          }

          this.logger.error(`Allegro search failed: ${error.message}`);
        }

        throw error;
      }
    }
  }
}
