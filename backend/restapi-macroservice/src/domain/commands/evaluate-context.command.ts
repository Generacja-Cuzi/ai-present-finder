import { Command } from "@nestjs/cqrs";

import type { ChatMessage } from "../models/chat-message";
import type { ContextDto } from "../models/context.dto";

export class EvaluateContextCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly messages?: ChatMessage[],
  ) {
    super();
  }
}
