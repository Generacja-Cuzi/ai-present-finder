import { Command } from "@nestjs/cqrs";

export class AddToFavoritesCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly listingId: string,
  ) {
    super();
  }
}
