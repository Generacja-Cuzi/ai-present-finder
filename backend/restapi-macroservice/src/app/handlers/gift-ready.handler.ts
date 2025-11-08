import { GiftReadyEvent } from "@core/events";
import type { ListingWithId } from "@core/types";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { SaveListingsCommand } from "src/domain/commands/save-listings.command";
import { SaveUserProfileCommand } from "src/domain/commands/save-user-profile.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftReadyHandler {
  private readonly logger = new Logger(GiftReadyHandler.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly chatRepository: IChatRepository,
  ) {}

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

    // Get chat to update reasoning summary and optionally save profile
    const chat = await this.chatRepository.findByChatId(event.chatId);
    if (chat === null) {
      this.logger.error(`Chat ${event.chatId} not found`);
    } else {
      // Save reasoning summary to chat
      if (
        event.profile?.recipient_profile ||
        event.profile?.key_themes_and_keywords
      ) {
        await this.chatRepository.update(chat.id, {
          reasoningSummary: {
            recipientProfile: event.profile.recipient_profile ?? undefined,
            keyThemesAndKeywords: event.profile.key_themes_and_keywords,
          },
        });
        this.logger.log(`Reasoning summary saved for chat ${event.chatId}`);
      }

      // Save user profile if requested
      if (
        event.profile?.save_profile === true &&
        event.profile.profile_name !== null &&
        event.profile.profile_name !== undefined &&
        event.profile.recipient_profile !== null
      ) {
        this.logger.log(
          `Saving user profile "${event.profile.profile_name}" for chat ${event.chatId}`,
        );

        await this.commandBus.execute(
          new SaveUserProfileCommand(
            chat.userId,
            event.chatId,
            event.profile.profile_name,
            event.profile.recipient_profile,
            event.profile.key_themes_and_keywords,
          ),
        );

        this.logger.log(`User profile saved successfully`);
        this.logger.log(`Profile details: ${JSON.stringify(event.profile)}`);
      } else {
        this.logger.log(
          `Skipping profile save (save_profile=${String(event.profile?.save_profile)}, profile_name=${String(event.profile?.profile_name)})`,
        );
      }
    }

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "gift-ready",
        data: listingsWithIds,
      }),
    );
  }
}
