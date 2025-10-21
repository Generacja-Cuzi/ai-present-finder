import type { Message } from "src/domain/entities/message.entity";
import { GetChatMessagesQuery } from "src/domain/queries/get-chat-messages.query";
import { IMessageRepository } from "src/domain/repositories/imessage.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesHandler
  implements IQueryHandler<GetChatMessagesQuery>
{
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(query: GetChatMessagesQuery): Promise<Message[]> {
    return this.messageRepository.findByChatId(query.chatId);
  }
}
