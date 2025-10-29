import type { ChatMessage, RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class GenerateQuestionCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly occasion: string,
    public readonly history: ChatMessage[],
    public readonly userProfile?: RecipientProfile,
  ) {
    super();
  }
}
