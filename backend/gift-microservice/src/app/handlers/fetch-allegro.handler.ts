// application/handlers/fetch-allegro.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FetchAllegroQuery } from '../../domain/queries/fetch-allegro.query';
import { ListingDto } from 'src/domain/models/listing.dto';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface AllegroTokenResponse {
  access_token: string;
  expires_in: number;
}

interface AllegroOffer {
  id: string;
  name: string;
  images?: Array<{ url: string }>;
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
    process.env.ALLEGRO_CLIENT_ID || '36fc4e49b99e4152874b49ab463e7b64';
  private readonly CLIENT_SECRET =
    process.env.ALLEGRO_CLIENT_SECRET ||
    'keh75yd5gmEBZJWk7S7LfRtVhYyOvoxlSoLBINIcmynBOxpiDVdDEyU2eTD5EiBi';

  private readonly TOKEN_URL =
    process.env.ALLEGRO_TOKEN_URL ||
    'https://allegro.pl.allegrosandbox.pl/auth/oauth/token';
  private readonly SEARCH_URL =
    process.env.ALLEGRO_SEARCH_URL ||
    'https://api.allegro.pl.allegrosandbox.pl/offers/listing';
  private readonly BASE_OFFER_URL =
    process.env.ALLEGRO_BASE_OFFER_URL ||
    'https://allegro.pl.allegrosandbox.pl/oferta';

  private readonly MAX_RETRIES = parseInt(
    process.env.ALLEGRO_MAX_RETRIES || '3',
  );

  // Cache for access token
  private tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  private async getAppToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const basic = Buffer.from(
      `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
    });

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Allegro token request failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    const json = (await response.json()) as AllegroTokenResponse;

    // Cache the token (expires_in is in seconds)
    this.tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in - 60) * 1000, // 60s buffer
    };

    return json.access_token;
  }

  private async searchOffers(
    phrase: string,
    opts: { offset?: number; limit?: number } = {},
  ): Promise<AllegroSearchResponse> {
    if (!phrase) {
      throw new Error('Musisz podać parametr phrase');
    }

    const token = await this.getAppToken();

    const params = new URLSearchParams();
    params.set('phrase', phrase);
    if (opts.offset) params.set('offset', String(opts.offset));
    if (opts.limit) params.set('limit', String(opts.limit));

    const url = `${this.SEARCH_URL}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.allegro.public.v1+json',
        'Accept-Language': 'pl-PL',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Allegro search request failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    return (await response.json()) as AllegroSearchResponse;
  }

  private parsePrice(priceString: string): number | null {
    if (!priceString) return null;

    // Remove all non-digit and non-decimal characters, keep only digits and . or ,
    const cleanPrice = priceString.replace(/[^\d.,]/g, '');

    if (!cleanPrice) return null;

    // Handle Polish number format (65,99) vs international (65.99)
    if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
      // Format like 1.234,56 (European with thousands separator)
      const parsed = cleanPrice.replace(/\./g, '').replace(/,/g, '.');
      return parseFloat(parsed);
    } else if (cleanPrice.includes(',')) {
      // Could be 65,99 (European decimal) or 1,234 (thousands separator)
      const parts = cleanPrice.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal: 65,99
        return parseFloat(cleanPrice.replace(',', '.'));
      } else {
        // Likely thousands separator: 1,234
        return parseFloat(cleanPrice.replace(/,/g, ''));
      }
    } else {
      // Only dots or no separators
      return parseFloat(cleanPrice);
    }
  }

  async execute(query: FetchAllegroQuery): Promise<ListingDto[]> {
    const { query: searchQuery, limit, offset } = query;

    let attempt = 0;

    while (true) {
      attempt++;

      try {
        this.logger.log(
          `Searching Allegro for "${searchQuery}" (limit=${limit}, offset=${offset}), attempt ${attempt}`,
        );

        const results = await this.searchOffers(searchQuery, { limit, offset });

        // Combine promoted and regular offers
        const offers = [
          ...(results.items?.promoted || []),
          ...(results.items?.regular || []),
        ];

        const listings: ListingDto[] = offers.map((offer) => {
          const priceAmount = offer.sellingMode?.price?.amount;
          const priceCurrency = offer.sellingMode?.price?.currency || 'PLN';

          return {
            image: offer.images?.[0]?.url || null,
            title: offer.name || '',
            description: offer.name || '', // Allegro listing doesn't include full description
            link: `${this.BASE_OFFER_URL}/${offer.id}`,
            price: {
              value: priceAmount ? this.parsePrice(priceAmount) : null,
              label: priceAmount ? `${priceAmount} ${priceCurrency}` : null,
              currency: priceCurrency,
              negotiable: false, // Allegro typically doesn't support price negotiation
            },
          } as ListingDto;
        });

        this.logger.log(
          `Fetched ${listings.length} Allegro listings for query="${searchQuery}" (limit=${limit}, offset=${offset})`,
        );

        return listings;
      } catch (error: unknown) {
        const errorObj = error as { code?: string; message?: string };

        // Handle retryable errors
        if (
          attempt < this.MAX_RETRIES &&
          (errorObj.code === 'ENOTFOUND' ||
            errorObj.code === 'ECONNRESET' ||
            errorObj.message?.includes('429') ||
            errorObj.message?.includes('500') ||
            errorObj.message?.includes('502') ||
            errorObj.message?.includes('503') ||
            errorObj.message?.includes('504'))
        ) {
          const base = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
          const jitter = Math.floor(Math.random() * 500);
          const delayMs = base + jitter;

          this.logger.warn(
            `Allegro error, retry #${attempt} in ${delayMs}ms: ${errorObj.message || 'Unknown error'}`,
          );

          await sleep(delayMs);
          continue;
        }

        // Handle authentication errors
        if (
          errorObj.message?.includes('401') ||
          errorObj.message?.includes('403')
        ) {
          this.logger.error(
            `Allegro API authentication error: ${errorObj.message}. Check ALLEGRO_CLIENT_ID and ALLEGRO_CLIENT_SECRET.`,
          );

          // Clear token cache on auth errors
          this.tokenCache = null;

          throw new Error(
            `Allegro API authentication failed: ${errorObj.message}`,
          );
        }

        this.logger.error(
          `Allegro search failed: ${errorObj.message || 'Unknown error'}`,
        );
        throw error;
      }
    }
  }
}
