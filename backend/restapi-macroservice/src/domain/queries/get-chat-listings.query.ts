import { Query } from "@nestjs/cqrs";

import type { Chat } from "../entities/chat.entity";
import type { Listing } from "../entities/listing.entity";

export interface ChatListingsResult {
  chat: Chat;
  listings: Listing[];
}

export class GetChatListingsQuery extends Query<ChatListingsResult> {
  constructor(
    public readonly chatId: string,
    public readonly userId?: string,
  ) {
    super();
  }
}
