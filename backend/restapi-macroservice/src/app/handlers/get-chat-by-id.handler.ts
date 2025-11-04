import type { Chat } from "src/domain/entities/chat.entity";
import { GetChatByIdQuery } from "src/domain/queries/get-chat-by-id.query";
import { IChatRepository } from "src/domain/repositories/ichat.repository";

import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetChatByIdQuery)
export class GetChatByIdHandler implements IQueryHandler<GetChatByIdQuery> {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(query: GetChatByIdQuery): Promise<Chat> {
    const chat = await this.chatRepository.findByChatIdWithListings(
      query.chatId,
    );

    if (chat === null) {
      throw new NotFoundException(`Chat with ID ${query.chatId} not found`);
    }

    // Note: ResourceOwnershipGuard already verified ownership before this handler runs
    // This is just a safety check in case the handler is called from elsewhere
    if (chat.userId !== query.userId) {
      throw new NotFoundException(`Chat with ID ${query.chatId} not found`);
    }

    return chat;
  }
}
