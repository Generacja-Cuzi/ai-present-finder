import type { ContextDto } from "../models/context.dto";
import type { EndConversationOutput } from "../models/end-converstion-ai-output";

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput,
  ) {}
}
