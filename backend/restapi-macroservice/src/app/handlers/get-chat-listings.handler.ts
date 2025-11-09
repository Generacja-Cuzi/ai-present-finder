import { GetChatListingsQuery } from "src/domain/queries/get-chat-listings.query";
import type { ChatListingsResult } from "src/domain/queries/get-chat-listings.query";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetChatListingsQuery)
export class GetChatListingsHandler
  implements IQueryHandler<GetChatListingsQuery, ChatListingsResult>
{
  constructor(
    private readonly listingRepository: IListingRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(query: GetChatListingsQuery): Promise<ChatListingsResult> {
    const [listings, chat] = await Promise.all([
      this.listingRepository.findByChatId(query.chatId),
      this.chatRepository.findByChatId(query.chatId),
    ]);

    if (chat == null) {
      throw new Error(`Chat with id ${query.chatId} not found`);
    }

    return {
      chat,
      listings,
    };
  }
}
