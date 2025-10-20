import { Query } from "@nestjs/cqrs";

import type { Chat } from "../entities/chat.entity";

export class GetUserChatsQuery extends Query<Chat[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
