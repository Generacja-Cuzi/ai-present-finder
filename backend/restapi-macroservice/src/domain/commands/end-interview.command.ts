import { Command } from "@nestjs/cqrs";

import type { ContextDto } from "../models/context.dto";
import type { EndConversationOutput } from "../models/end-converstion-ai-output";

export class EndInterviewCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput | null,
  ) {
    super();
  }
}
