import { Query } from "@nestjs/cqrs";

import { Chat } from "../entities/chat.entity";

export class GetUserChatsQuery extends Query<Chat[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
