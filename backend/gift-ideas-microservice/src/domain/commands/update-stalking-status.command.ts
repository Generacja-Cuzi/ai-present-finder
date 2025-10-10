import { Command } from "@nestjs/cqrs";

export class UpdateStalkingStatusCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly keywords: string[],
  ) {
    super();
  }
}
