import { ListingWithId } from "@core/types";

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

    const BATCH_SIZE = 100;
    this.logger.log(
      `Starting batched AI ranking of ${String(products.length)} products for session ${eventId} (processing in batches of ${BATCH_SIZE.toString()})`,
    );

    const scoredProducts: ProductScore[] = [];

    while (scoredProducts.length < products.length) {
      const remainingProducts = products.filter(
        (p) => !scoredProducts.some((r) => r.id === p.id),
      );
      const batch = remainingProducts.slice(0, BATCH_SIZE);
      const startTime = performance.now();
      const batchResults = await scoreProductsFlow({
        products: batch.map(
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
      const endTime = performance.now();
      const duration = endTime - startTime;
      scoredProducts.push(...batchResults);
      this.logger.log(
        `Processed ${String(scoredProducts.length)} products out of ${String(products.length)} total in ${duration.toFixed(2)}ms.`,
      );
    }

    this.logger.log(
      `Completed AI ranking of ${String(scoredProducts.length)} products for session ${eventId}`,
    );

    return scoredProducts;
  }
}
