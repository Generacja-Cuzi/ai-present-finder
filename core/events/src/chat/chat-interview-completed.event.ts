import type { EndConversationOutput } from "@core/types";
import type { ContextDto } from "@core/types";

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput,
  ) {}
}
