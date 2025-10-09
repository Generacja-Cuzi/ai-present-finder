import type { ChatMessage, ContextDto } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class EvaluateContextCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly messages?: ChatMessage[],
  ) {
    super();
  }
}
