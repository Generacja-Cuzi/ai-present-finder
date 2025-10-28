import type { RecipientProfile } from "@core/types";
import type { ProductScore } from "src/app/ai/types";

import { Command } from "@nestjs/cqrs";

import type { Product } from "../entities/product.entity";

export class ScoreProductsCommand extends Command<ProductScore[]> {
  constructor(
    public readonly products: Product[],
    public readonly recipientProfile: RecipientProfile | null,
    public readonly keywords: string[],
    public readonly eventId: string,
  ) {
    super();
  }
}
