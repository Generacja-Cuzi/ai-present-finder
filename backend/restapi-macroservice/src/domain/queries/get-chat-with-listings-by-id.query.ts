import { Query } from "@nestjs/cqrs";

import type { Chat } from "../entities/chat.entity";
import type { UserRole } from "../entities/user.entity";

export class GetChatWithListingsByIdQuery extends Query<Chat | null> {
  constructor(
    public readonly chatId: string,
    public readonly userId: string,
    public readonly userRole?: UserRole,
  ) {
    super();
  }
}
