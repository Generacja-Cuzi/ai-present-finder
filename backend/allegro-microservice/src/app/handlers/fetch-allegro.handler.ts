// application/handlers/fetch-allegro.handler.ts
import { ListingDto } from "src/domain/models/listing.dto";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { FetchAllegroQuery } from "../../domain/queries/fetch-allegro.query";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface AllegroTokenResponse {
  access_token: string;
  expires_in: number;
}

interface AllegroOffer {
  id: string;
  name: string;
  images?: { url: string }[];
  sellingMode?: {
    price?: {
      amount: string;
      currency: string;
    };
  };
  description?: string;
}

interface AllegroSearchResponse {
  items?: {
    promoted?: AllegroOffer[];
    regular?: AllegroOffer[];
  };
}

@QueryHandler(FetchAllegroQuery)
export class FetchAllegroHandler
  implements IQueryHandler<FetchAllegroQuery, ListingDto[]>
{
  private readonly logger = new Logger(FetchAllegroHandler.name);

  private readonly CLIENT_ID =
    process.env.ALLEGRO_CLIENT_ID ?? "36fc4e49b99e4152874b49ab463e7b64";
  private readonly CLIENT_SECRET =
    process.env.ALLEGRO_CLIENT_SECRET ??
    "keh75yd5gmEBZJWk7S7LfRtVhYyOvoxlSoLBINIcmynBOxpiDVdDEyU2eTD5EiBi";
  "keh75yd5gmEBZJWk7S7LfRtVhYyOvoxlSoLBINIcmynBOxpiDVdDEyU2eTD5EiBi";

  private readonly TOKEN_URL =
    process.env.ALLEGRO_TOKEN_URL ??
    "https://allegro.pl.allegrosandbox.pl/auth/oauth/token";
  private readonly SEARCH_URL =
    process.env.ALLEGRO_SEARCH_URL ??
    "https://api.allegro.pl.allegrosandbox.pl/offers/listing";
  private readonly BASE_OFFER_URL =
    process.env.ALLEGRO_BASE_OFFER_URL ??
    "https://allegro.pl.allegrosandbox.pl/oferta";

  private readonly MAX_RETRIES = Number.parseInt(
    process.env.ALLEGRO_MAX_RETRIES ?? "3",
  );

  private tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  private async getAppToken(): Promise<string> {
    if (this.tokenCache != null && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const basic = Buffer.from(
      `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    const response = await fetch(this.TOKEN_URL, {
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
    options: { offset?: number; limit?: number } = {},
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

    const url = `${this.SEARCH_URL}?${parameters.toString()}`;

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

  async execute(query: FetchAllegroQuery): Promise<ListingDto[]> {
    const { query: searchQuery, limit, offset } = query;

    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching Allegro for "${searchQuery}" (limit=${limit.toString()}, offset=${offset.toString()}), attempt ${attempt.toString()}`,
        );

        const results = await this.searchOffers(searchQuery, { limit, offset });

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
            link: `${this.BASE_OFFER_URL}/${offer.id}`,
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
          `Fetched ${listings.length.toString()} Allegro listings for query="${searchQuery}" (limit=${limit.toString()}, offset=${offset.toString()})`,
        );

        return listings;
      } catch (error: unknown) {
        const errorObject = error as { code?: string; message?: string };

        if (
          attempt < this.MAX_RETRIES &&
          (errorObject.code === "ENOTFOUND" ||
            errorObject.code === "ECONNRESET" ||
            errorObject.message?.includes("429") === true ||
            errorObject.message?.includes("500") === true ||
            errorObject.message?.includes("502") === true ||
            errorObject.message?.includes("503") === true ||
            errorObject.message?.includes("504") === true)
        ) {
          const base = Math.min(4000, 1000 * 2 ** (attempt - 1));
          const jitter = Math.floor(Math.random() * 500);
          const delayMs = base + jitter;

          this.logger.warn(
            `Allegro error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${errorObject.message ?? "Unknown error"}`,
          );

          await sleep(delayMs);
          continue;
        }

        if (
          errorObject.message?.includes("401") === true ||
          errorObject.message?.includes("403") === true
        ) {
          this.logger.error(
            `Allegro API authentication error: ${errorObject.message}. Check ALLEGRO_CLIENT_ID and ALLEGRO_CLIENT_SECRET.`,
          );

          this.tokenCache = null;

          throw new Error(
            `Allegro API authentication failed: ${errorObject.message}`,
          );
        }

        this.logger.error(
          `Allegro search failed: ${errorObject.message ?? "Unknown error"}`,
        );
        throw error;
      }
    }
  }
}
