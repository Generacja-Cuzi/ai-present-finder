import { Command } from "@nestjs/cqrs";

export class SetOccasionCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly occasion: string,
  ) {
    super();
  }
}
