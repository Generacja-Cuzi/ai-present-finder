import { Command } from "@nestjs/cqrs";

export class RemoveFromFavoritesCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly listingId: string,
  ) {
    super();
  }
}
