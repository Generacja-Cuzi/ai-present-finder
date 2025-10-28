import { Query } from "@nestjs/cqrs";

import type { GiftSession } from "../entities/gift-session.entity";
import type { Product } from "../entities/product.entity";

export interface SessionProductsResult {
  session: GiftSession;
  allProducts: Product[];
}
export class GetSessionProductsQuery extends Query<SessionProductsResult | null> {
  constructor(public readonly eventId: string) {
    super();
  }
}
