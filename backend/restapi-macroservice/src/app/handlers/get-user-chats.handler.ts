import type { Chat } from "src/domain/entities/chat.entity";
import { GetUserChatsQuery } from "src/domain/queries/get-user-chats.query";
import { IChatRepository } from "src/domain/repositories/ichat.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetUserChatsQuery)
export class GetUserChatsHandler implements IQueryHandler<GetUserChatsQuery> {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(query: GetUserChatsQuery): Promise<Chat[]> {
    return this.chatRepository.findByUserId(query.userId);
  }
}
