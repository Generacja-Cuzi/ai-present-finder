import { SaveListingsCommand } from "src/domain/commands/save-listings.command";
import type { Listing } from "src/domain/entities/listing.entity";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(SaveListingsCommand)
export class SaveListingsHandler
  implements ICommandHandler<SaveListingsCommand>
{
  private readonly logger = new Logger(SaveListingsHandler.name);

  constructor(
    private readonly listingRepository: IListingRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(command: SaveListingsCommand): Promise<Listing[]> {
    const { chatId, listings } = command;

    this.logger.log(
      `Saving ${String(listings.length)} listings for chat ${chatId}`,
    );

    // Get current chat to retrieve currentRound
    const chat = await this.chatRepository.findByChatId(chatId);
    if (!chat) {
      throw new Error(`Chat with chatId ${chatId} not found`);
    }

    const round = chat.currentRound + 1;
    this.logger.log(`Assigning round ${String(round)} to new listings`);

    // Update chat's currentRound
    await this.chatRepository.update(chat.id, {
      currentRound: round,
    });

    const savedListings = await Promise.all(
      listings.map(async (listing) =>
        this.listingRepository.create({
          chatId,
          image: listing.image,
          title: listing.title,
          description: listing.description,
          link: listing.link,
          priceValue: listing.price.value,
          priceLabel: listing.price.label,
          priceCurrency: listing.price.currency,
          priceNegotiable: listing.price.negotiable ?? false,
          category: listing.category ?? null,
          provider: listing.provider ?? "unknown",
          round,
        }),
      ),
    );

    this.logger.log(`Successfully saved ${String(listings.length)} listings`);

    return savedListings;
  }
}
