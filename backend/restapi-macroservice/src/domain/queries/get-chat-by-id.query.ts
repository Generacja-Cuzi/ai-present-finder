import { Query } from "@nestjs/cqrs";

import type { Chat } from "../entities/chat.entity";

export class GetChatByIdQuery extends Query<Chat | null> {
  constructor(
    public readonly chatId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
