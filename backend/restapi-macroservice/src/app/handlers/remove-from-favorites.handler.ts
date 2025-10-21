import { RemoveFromFavoritesCommand } from "src/domain/commands/remove-from-favorites.command";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(RemoveFromFavoritesCommand)
export class RemoveFromFavoritesHandler
  implements ICommandHandler<RemoveFromFavoritesCommand>
{
  constructor(private readonly listingRepository: IListingRepository) {}

  async execute(command: RemoveFromFavoritesCommand): Promise<void> {
    await this.listingRepository.removeFromUserFavorites(
      command.userId,
      command.listingId,
    );
  }
}
