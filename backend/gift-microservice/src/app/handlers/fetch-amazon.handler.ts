// application/handlers/fetch-amazon.handler.ts
import { ListingDto } from "src/domain/models/listing.dto";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { FetchAmazonQuery } from "../../domain/queries/fetch-amazon.query";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@QueryHandler(FetchAmazonQuery)
export class FetchAmazonHandler
  implements IQueryHandler<FetchAmazonQuery, ListingDto[]>
{
  private readonly logger = new Logger(FetchAmazonHandler.name);

  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  private readonly API_URL =
    process.env.AMAZON_API_URL ??
    "https://real-time-amazon-data.p.rapidapi.com/search";
  private readonly API_HOST =
    process.env.AMAZON_API_HOST ?? "real-time-amazon-data.p.rapidapi.com";
  private readonly DEFAULT_COUNTRY = process.env.AMAZON_COUNTRY ?? "PL";
  private readonly MAX_RETRIES = Number.parseInt(
    process.env.AMAZON_MAX_RETRIES ?? "3",
  );

  async execute(query: FetchAmazonQuery): Promise<ListingDto[]> {
    const { query: searchQuery, limit, offset, country, page } = query;

    let attempt = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      attempt++;

      try {
        const searchParameters = new URLSearchParams({
          query: searchQuery,
          country: country || this.DEFAULT_COUNTRY,
          page: page.toString(),
        });

        const searchUrl = `${this.API_URL}?${searchParameters.toString()}`;

        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": this.RAPIDAPI_KEY ?? "",
            "X-RapidAPI-Host": this.API_HOST,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as {
            status: string;
            request_id?: string;
            data?: {
              products?: {
                product_title?: string;
                product_price?: string;
                product_original_price?: string;
                currency?: string;
                product_url?: string;
                product_photo?: string;
                product_num_ratings?: number;
                product_star_rating?: string;
                product_availability?: string;
              }[];
            };
          };

          if (data.status !== "OK" || data.data?.products == null) {
            this.logger.warn(
              `Amazon API returned non-OK status: ${data.status}`,
            );
            return [];
          }

          const items = data.data.products ?? [];

          const paginatedItems = items.slice(offset, offset + limit);

          const listings: ListingDto[] = paginatedItems.map((item) => {
            return {
              image: item.product_photo ?? null,
              title: item.product_title ?? "",
              description: item.product_title ?? "",
              link: item.product_url ?? "",
              price: {
                value: null,
                label:
                  item.product_price ?? item.product_original_price ?? null,
                currency: item.currency ?? "PLN",
                negotiable: false,
              },
            } as ListingDto;
          });

          this.logger.log(
            `Fetched ${listings.length.toString()} Amazon listings for query="${searchQuery}" (limit=${limit.toString()}, offset=${offset.toString()})`,
          );

          return listings;
        }

        if ([429, 500, 502, 503, 504].includes(response.status)) {
          const errorText = await response.text().catch(() => "");
          this.logger.warn(
            `Amazon API error ${response.status.toString()}: ${errorText}`,
          );

          if (attempt < this.MAX_RETRIES) {
            const base = Math.min(4000, 1000 * 2 ** (attempt - 1));
            const jitter = Math.floor(Math.random() * 500);
            const delayMs = base + jitter;
            this.logger.warn(
              `Amazon retry #${attempt.toString()} in ${delayMs.toString()}ms`,
            );
            await sleep(delayMs);
            continue;
          }
        }

        if ([401, 403].includes(response.status)) {
          const errorText = await response.text().catch(() => "");
          this.logger.error(
            `Amazon API authentication error ${response.status.toString()}: ${errorText}. Check RAPIDAPI_KEY.`,
          );
          throw new Error(
            `Amazon API authentication failed: ${response.status.toString()}`,
          );
        }

        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Amazon API error ${response.status.toString()}: ${errorText}`,
        );
      } catch (error: unknown) {
        const errorObject = error as { code?: string; message?: string };
        if (
          attempt < this.MAX_RETRIES &&
          (errorObject.code === "ENOTFOUND" ||
            errorObject.code === "ECONNRESET")
        ) {
          const base = Math.min(4000, 1000 * 2 ** (attempt - 1));
          const jitter = Math.floor(Math.random() * 500);
          const delayMs = base + jitter;
          this.logger.warn(
            `Amazon network error, retry #${attempt.toString()} in ${delayMs.toString()}ms: ${errorObject.message ?? "Unknown error"}`,
          );
          await sleep(delayMs);
          continue;
        }

        this.logger.error(
          `Amazon search failed: ${errorObject.message ?? "Unknown error"}`,
        );
        throw error;
      }
    }
  }
}
