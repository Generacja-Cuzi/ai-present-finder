import { Query } from "@nestjs/cqrs";

import type { Message } from "../entities/message.entity";

export class GetChatMessagesQuery extends Query<Message[]> {
  constructor(public readonly chatId: string) {
    super();
  }
}
