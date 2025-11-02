import { Command } from "@nestjs/cqrs";

export class CreateFeedbackCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
    public readonly rating: number,
    public readonly comment: string | null,
  ) {
    super();
  }
}
