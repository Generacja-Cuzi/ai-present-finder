import type { ChatMessage, ContextDto } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class GenerateQuestionCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {
    super();
  }
}
