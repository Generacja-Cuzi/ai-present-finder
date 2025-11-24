import { Command } from "@nestjs/cqrs";

export class StartChatRefinementCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly selectedListingIds: string[],
  ) {
    super();
  }
}
