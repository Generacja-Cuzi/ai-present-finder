import { SaveListingsCommand } from "src/domain/commands/save-listings.command";
import type { Listing } from "src/domain/entities/listing.entity";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(SaveListingsCommand)
export class SaveListingsHandler
  implements ICommandHandler<SaveListingsCommand>
{
  private readonly logger = new Logger(SaveListingsHandler.name);

  constructor(private readonly listingRepository: IListingRepository) {}

  async execute(command: SaveListingsCommand): Promise<Listing[]> {
    const { chatId, listings } = command;

    this.logger.log(
      `Saving ${String(listings.length)} listings for chat ${chatId}`,
    );

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
        }),
      ),
    );

    this.logger.log(`Successfully saved ${String(listings.length)} listings`);

    return savedListings;
  }
}
