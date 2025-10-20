import { Query } from "@nestjs/cqrs";

import type { Listing } from "../entities/listing.entity";

export class GetUserFavoritesQuery extends Query<Listing[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
