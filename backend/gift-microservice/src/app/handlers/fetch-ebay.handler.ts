// application/handlers/fetch-ebay.handler.ts
import { ListingDto } from "src/domain/models/listing.dto";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { FetchEbayQuery } from "../../domain/queries/fetch-ebay.query";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@QueryHandler(FetchEbayQuery)
export class FetchEbayHandler
  implements IQueryHandler<FetchEbayQuery, ListingDto[]>
{
  private readonly logger = new Logger(FetchEbayHandler.name);

  private readonly CLIENT_ID = process.env.EBAY_CLIENT_ID ?? "";
  private readonly CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET ?? "";
  private readonly TOKEN_URL = process.env.EBAY_TOKEN_URL ?? "";
  private readonly SEARCH_URL = process.env.EBAY_SEARCH_URL ?? "";
  private readonly OAUTH_SCOPE = process.env.EBAY_OAUTH_SCOPE ?? "";
  private readonly MARKETPLACE_ID =
    process.env.EBAY_MARKETPLACE_ID ?? "EBAY_PL";
  private readonly MAX_RETRIES = Number.parseInt(
    process.env.EBAY_MAX_RETRIES ?? "3",
  );
  private readonly TOKEN_BUFFER_SECONDS = Number.parseInt(
    process.env.EBAY_TOKEN_BUFFER_SECONDS ?? "300",
  );

  // Cache for access token
  private cachedToken: { token: string; expiresAt: number } | null = null;

  // Helper: get application access token using client credentials grant
  private async getAppAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken != null && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    const basicAuth = Buffer.from(
      `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: this.OAUTH_SCOPE,
    });

    const response = await fetch(this.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `eBay token request failed: ${response.status.toString()} ${errorText}`,
      );
      throw new Error(
        `Failed to get eBay access token: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    // Cache the token (eBay tokens typically last 2 hours, cache for 1.5 hours to be safe)
    this.cachedToken = {
      token: data.access_token,
      expiresAt:
        Date.now() + (data.expires_in - this.TOKEN_BUFFER_SECONDS) * 1000,
    };

    return data.access_token;
  }

  async execute(query: FetchEbayQuery): Promise<ListingDto[]> {
    const { query: searchQuery, limit, offset } = query;

    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        // Get access token
        const token = await this.getAppAccessToken();

        // Build search URL with parameters
        const searchParameters = new URLSearchParams({
          q: searchQuery,
          limit: limit.toString(),
          offset: offset.toString(),
          // Add additional filters if needed
          // filter: 'conditionIds:{1000|1500|2000|2500|3000|4000|5000}', // New, Used, etc.
        });

        const searchUrl = `${this.SEARCH_URL}?${searchParameters.toString()}`;

        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-EBAY-C-MARKETPLACE-ID": this.MARKETPLACE_ID,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as {
            itemSummaries?: {
              title?: string;
              shortDescription?: string;
              itemWebUrl?: string;
              itemHref?: string;
              image?: { imageUrl?: string };
              thumbnailImages?: { imageUrl?: string }[];
              price?: { value?: string; currency?: string };
            }[];
          };

          const items = data.itemSummaries ?? [];

          const listings: ListingDto[] = items.map((item) => {
            // Get the first image or null
            const image =
              item.image?.imageUrl ??
              item.thumbnailImages?.[0]?.imageUrl ??
              null;

            // Extract price information
            const priceInfo = item.price ?? {};
            const priceValue =
              priceInfo.value == null
                ? null
                : Number.parseFloat(priceInfo.value);

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
            } as ListingDto;
          });

          this.logger.log(
            `Fetched ${listings.length.toString()} eBay listings for query="${searchQuery}" (limit=${limit.toString()}, offset=${offset.toString()})`,
          );

          return listings;
        }

        // Handle rate limiting and server errors
        if ([429, 500, 502, 503, 504].includes(response.status)) {
          const errorText = await response.text().catch(() => "");
          this.logger.warn(
            `eBay API error ${response.status.toString()}: ${errorText}`,
          );

          if (attempt <= this.MAX_RETRIES) {
            const base = Math.min(4000, 1000 * 2 ** (attempt - 1));
            const jitter = Math.floor(Math.random() * 500);
            const delayMs = base + jitter;
            this.logger.warn(
              `eBay retry #${attempt.toString()} in ${delayMs.toString()}ms`,
            );
            await sleep(delayMs);
            continue;
          }
        }

        // Handle 401 (token expired) by clearing cache and retrying once
        if (response.status === 401 && attempt === 1) {
          this.logger.warn("eBay token expired, clearing cache and retrying");
          this.cachedToken = null;
          continue;
        }

        // For other errors, throw immediately
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `eBay API error ${response.status.toString()}: ${errorText}`,
        );
      } catch (error: unknown) {
        const errorObject = error as { code?: string; message?: string };
        if (
          attempt <= this.MAX_RETRIES &&
          (errorObject.code === "ENOTFOUND" ||
            errorObject.code === "ECONNRESET")
        ) {
          const base = Math.min(4000, 1000 * 2 ** (attempt - 1));
          const jitter = Math.floor(Math.random() * 500);
          const delayMs = base + jitter;
          this.logger.warn(
            `eBay network error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${errorObject.message ?? "Unknown error"}`,
          );
          await sleep(delayMs);
          continue;
        }

        this.logger.error(
          `eBay search failed: ${errorObject.message ?? "Unknown error"}`,
        );
        throw error;
      }
    }
  }
}
