import { AddToFavoritesCommand } from "src/domain/commands/add-to-favorites.command";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(AddToFavoritesCommand)
export class AddToFavoritesHandler
  implements ICommandHandler<AddToFavoritesCommand>
{
  constructor(private readonly listingRepository: IListingRepository) {}

  async execute(command: AddToFavoritesCommand): Promise<void> {
    await this.listingRepository.addToUserFavorites(
      command.userId,
      command.listingId,
    );
  }
}
