import { Command } from "@nestjs/cqrs";

import { ChatMessage } from "../models/chat-message";
import { ContextDto } from "../models/context.dto";

export class EvaluateContextCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly messages?: ChatMessage[],
  ) {
    super();
  }
}
