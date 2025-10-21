import type { Listing } from "src/domain/entities/listing.entity";
import { GetChatListingsQuery } from "src/domain/queries/get-chat-listings.query";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetChatListingsQuery)
export class GetChatListingsHandler
  implements IQueryHandler<GetChatListingsQuery>
{
  constructor(private readonly listingRepository: IListingRepository) {}

  async execute(query: GetChatListingsQuery): Promise<Listing[]> {
    return this.listingRepository.findByChatId(query.chatId);
  }
}
