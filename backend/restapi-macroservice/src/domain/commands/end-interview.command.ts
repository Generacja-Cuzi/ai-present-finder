import type { ContextDto, EndConversationOutput } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class EndInterviewCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput | null,
  ) {
    super();
  }
}
