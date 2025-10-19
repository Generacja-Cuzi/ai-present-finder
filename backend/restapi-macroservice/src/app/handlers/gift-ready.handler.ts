import { GiftReadyEvent } from "@core/events";
import type { ListingWithId } from "@core/types";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { SaveListingsCommand } from "src/domain/commands/save-listings.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftReadyHandler {
  private readonly logger = new Logger(GiftReadyHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GiftReadyEvent.name)
  async handle(event: GiftReadyEvent) {
    this.logger.log(`Uzyskano gotowe pomysly na prezenty`);

    const giftIdeas = event.giftIdeas;

    this.logger.log(
      `Pomysly na prezenty: ${giftIdeas.map((gift) => gift.title).join(";")}`,
    );

    // Save listings to database and get their IDs
    const savedListings = await this.commandBus.execute(
      new SaveListingsCommand(event.chatId, giftIdeas),
    );

    // Map saved listings to include their IDs
    const listingsWithIds: ListingWithId[] = savedListings.map(
      (listing, index) => ({
        ...giftIdeas[index],
        listingId: listing.id,
      }),
    );

    this.logger.log(
      `Saved listings with IDs: ${listingsWithIds.map((l) => l.listingId).join(", ")}`,
    );

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "gift-ready",
        data: listingsWithIds,
      }),
    );
  }
}
