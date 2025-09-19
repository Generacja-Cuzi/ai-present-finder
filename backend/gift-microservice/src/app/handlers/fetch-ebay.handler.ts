// application/handlers/fetch-ebay.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FetchEbayQuery } from '../../domain/queries/fetch-ebay.query';
import { ListingDto } from 'src/domain/models/listing.dto';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@QueryHandler(FetchEbayQuery)
export class FetchEbayHandler
  implements IQueryHandler<FetchEbayQuery, ListingDto[]>
{
  private readonly logger = new Logger(FetchEbayHandler.name);

  private readonly CLIENT_ID = process.env.EBAY_CLIENT_ID;
  private readonly CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

  // Cache for access token
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {}

  // Helper: get application access token using client credentials grant
  private async getAppAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    const tokenUrl = 'https://api.ebay.com/identity/v1/oauth2/token';
    const basicAuth = Buffer.from(
      `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `eBay token request failed: ${response.status} ${errorText}`,
      );
      throw new Error(`Failed to get eBay access token: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    // Cache the token (eBay tokens typically last 2 hours, cache for 1.5 hours to be safe)
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 5 minutes buffer
    };

    return data.access_token;
  }

  async execute(query: FetchEbayQuery): Promise<ListingDto[]> {
    const { query: searchQuery, limit, offset } = query;

    const maxRetries = 3;
    let attempt = 0;

    while (true) {
      attempt++;

      try {
        // Get access token
        const token = await this.getAppAccessToken();

        // Build search URL with parameters
        const endpoint =
          'https://api.ebay.com/buy/browse/v1/item_summary/search';
        const searchParams = new URLSearchParams({
          q: searchQuery,
          limit: limit.toString(),
          offset: offset.toString(),
          // Add additional filters if needed
          // filter: 'conditionIds:{1000|1500|2000|2500|3000|4000|5000}', // New, Used, etc.
        });

        const searchUrl = `${endpoint}?${searchParams.toString()}`;

        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_PL', // or EBAY_PL for Poland
          },
        });

        if (response.ok) {
          const data = (await response.json()) as {
            itemSummaries?: Array<{
              title?: string;
              shortDescription?: string;
              itemWebUrl?: string;
              itemHref?: string;
              image?: { imageUrl?: string };
              thumbnailImages?: Array<{ imageUrl?: string }>;
              price?: { value?: string; currency?: string };
            }>;
          };

          const items = data.itemSummaries || [];

          const listings: ListingDto[] = items.map((item) => {
            // Get the first image or null
            const image =
              item.image?.imageUrl ||
              item.thumbnailImages?.[0]?.imageUrl ||
              null;

            // Extract price information
            const priceInfo = item.price || {};
            const priceValue = priceInfo.value
              ? parseFloat(priceInfo.value)
              : null;

            return {
              image,
              title: item.title || '',
              description: item.shortDescription || item.title || '',
              link: item.itemWebUrl || item.itemHref || '',
              price: {
                value: priceValue,
                label: priceInfo.value
                  ? `${priceInfo.value} ${priceInfo.currency || ''}`
                  : null,
                currency: priceInfo.currency || null,
                negotiable: false, // eBay prices are typically fixed
              },
            } as ListingDto;
          });

          this.logger.log(
            `Fetched ${listings.length} eBay listings for query="${searchQuery}" (limit=${limit}, offset=${offset})`,
          );

          return listings;
        }

        // Handle rate limiting and server errors
        if ([429, 500, 502, 503, 504].includes(response.status)) {
          const errorText = await response.text().catch(() => '');
          this.logger.warn(`eBay API error ${response.status}: ${errorText}`);

          if (attempt <= maxRetries) {
            const base = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
            const jitter = Math.floor(Math.random() * 500);
            const delayMs = base + jitter;
            this.logger.warn(`eBay retry #${attempt} in ${delayMs}ms`);
            await sleep(delayMs);
            continue;
          }
        }

        // Handle 401 (token expired) by clearing cache and retrying once
        if (response.status === 401 && attempt === 1) {
          this.logger.warn('eBay token expired, clearing cache and retrying');
          this.cachedToken = null;
          continue;
        }

        // For other errors, throw immediately
        const errorText = await response.text().catch(() => '');
        throw new Error(`eBay API error ${response.status}: ${errorText}`);
      } catch (error: unknown) {
        const errorObj = error as { code?: string; message?: string };
        if (
          attempt <= maxRetries &&
          (errorObj.code === 'ENOTFOUND' || errorObj.code === 'ECONNRESET')
        ) {
          const base = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
          const jitter = Math.floor(Math.random() * 500);
          const delayMs = base + jitter;
          this.logger.warn(
            `eBay network error, retry #${attempt} in ${delayMs}ms: ${errorObj.message || 'Unknown error'}`,
          );
          await sleep(delayMs);
          continue;
        }

        this.logger.error(
          `eBay search failed: ${errorObj.message || 'Unknown error'}`,
        );
        throw error;
      }
    }
  }
}
