import { Query } from "@nestjs/cqrs";

import { Listing } from "../entities/listing.entity";

export class GetChatListingsQuery extends Query<Listing[]> {
  constructor(
    public readonly chatId: string,
    public readonly userId?: string,
  ) {
    super();
  }
}
