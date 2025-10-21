import type { ListingPayload } from "@core/types";
import type { Listing } from "src/domain/entities/listing.entity";

import { Command } from "@nestjs/cqrs";

export class SaveListingsCommand extends Command<Listing[]> {
  constructor(
    public readonly chatId: string,
    public readonly listings: ListingPayload[],
  ) {
    super();
  }
}
