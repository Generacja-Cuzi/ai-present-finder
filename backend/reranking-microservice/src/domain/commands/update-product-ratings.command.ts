import type { ProductScore } from "src/app/ai/types";

import { Command } from "@nestjs/cqrs";

import type { Product } from "../entities/product.entity";

export class UpdateProductRatingsCommand extends Command<void> {
  constructor(
    public readonly products: Product[],
    public readonly scoredProducts: ProductScore[],
    public readonly eventId: string,
  ) {
    super();
  }
}
