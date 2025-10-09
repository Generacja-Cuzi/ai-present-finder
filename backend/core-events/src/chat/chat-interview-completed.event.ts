import type { EndConversationOutput } from "../types";
import type { ContextDto } from "../types";

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput,
  ) {}
}
