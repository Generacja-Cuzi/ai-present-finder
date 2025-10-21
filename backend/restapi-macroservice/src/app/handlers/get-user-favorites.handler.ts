import type { Listing } from "src/domain/entities/listing.entity";
import { GetUserFavoritesQuery } from "src/domain/queries/get-user-favorites.query";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetUserFavoritesQuery)
export class GetUserFavoritesHandler
  implements IQueryHandler<GetUserFavoritesQuery>
{
  constructor(private readonly listingRepository: IListingRepository) {}

  async execute(query: GetUserFavoritesQuery): Promise<Listing[]> {
    return this.listingRepository.findUserFavorites(query.userId);
  }
}
