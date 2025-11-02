import { ListingWithId } from "@core/types";
import { chunk } from "lodash";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { ScoreProductsQuery } from "../../domain/queries/score-products.query";
import { scoreProductsFlow } from "../ai/score-products-flow";
import { ProductScore } from "../ai/types";

@QueryHandler(ScoreProductsQuery)
export class ScoreProductsHandler
  implements IQueryHandler<ScoreProductsQuery, ProductScore[]>
{
  private readonly logger = new Logger(ScoreProductsHandler.name);

  async execute(query: ScoreProductsQuery): Promise<ProductScore[]> {
    const { products, recipientProfile, keywords, eventId } = query;

    if (products.length === 0) {
      this.logger.warn(`No products to score for session ${eventId}`);
      return [];
    }

    const BATCH_SIZE = 50;
    this.logger.log(
      `Starting parallel AI ranking of ${String(products.length)} products for session ${eventId} (processing in batches of ${BATCH_SIZE.toString()})`,
    );

    // Transform products and create batches using lodash chunk
    const transformedProducts = products.map(
      (p) =>
        ({
          listingId: p.id,
          title: p.title,
          description: p.description,
          link: p.link,
          price: {
            value: p.priceValue,
            label: p.priceLabel,
            currency: p.priceCurrency,
            negotiable: p.priceNegotiable,
          },
          image: p.image,
          provider: p.provider,
          category: p.category,
        }) satisfies ListingWithId,
    );

    const batches = chunk(transformedProducts, BATCH_SIZE);

    this.logger.log(
      `Processing ${String(batches.length)} batches in parallel for session ${eventId}`,
    );

    // Process all batches in parallel
    const startTime = performance.now();
    const batchResults = await Promise.all(
      batches.map(async (batch, index) =>
        scoreProductsFlow({
          products: batch,
          recipientProfile,
          keywords,
        }).then((result) => {
          this.logger.log(
            `Batch ${String(index + 1)}/${String(batches.length)} completed for session ${eventId}`,
          );
          return result;
        }),
      ),
    );
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Flatten results
    const scoredProducts = batchResults.flat();

    this.logger.log(
      `Initial parallel AI ranking completed: ${String(scoredProducts.length)}/${String(products.length)} products scored in ${duration.toFixed(2)}ms`,
    );

    // Check for missing products and retry if necessary
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (
      scoredProducts.length < products.length &&
      retryCount < MAX_RETRIES
    ) {
      retryCount++;
      const scoredIds = new Set(scoredProducts.map((sp) => sp.id));
      const missingProducts = products.filter((p) => !scoredIds.has(p.id));

      this.logger.warn(
        `Retry ${String(retryCount)}/${String(MAX_RETRIES)}: ${String(missingProducts.length)} products missing scores for session ${eventId}`,
      );

      const retryStartTime = performance.now();
      const retryResults = await scoreProductsFlow({
        products: missingProducts.map(
          (p) =>
            ({
              listingId: p.id,
              title: p.title,
              description: p.description,
              link: p.link,
              price: {
                value: p.priceValue,
                label: p.priceLabel,
                currency: p.priceCurrency,
                negotiable: p.priceNegotiable,
              },
              image: p.image,
              provider: p.provider,
              category: p.category,
            }) satisfies ListingWithId,
        ),
        recipientProfile,
        keywords,
      });
      const retryEndTime = performance.now();
      const retryDuration = retryEndTime - retryStartTime;

      scoredProducts.push(...retryResults);
      this.logger.log(
        `Retry ${String(retryCount)} completed: scored ${String(retryResults.length)} products in ${retryDuration.toFixed(2)}ms`,
      );
    }

    if (scoredProducts.length < products.length) {
      this.logger.error(
        `Failed to score all products after ${String(MAX_RETRIES)} retries. Scored ${String(scoredProducts.length)}/${String(products.length)} for session ${eventId}`,
      );
    } else {
      this.logger.log(
        `Successfully scored all ${String(scoredProducts.length)} products for session ${eventId}`,
      );
    }

    return scoredProducts;
  }
}
