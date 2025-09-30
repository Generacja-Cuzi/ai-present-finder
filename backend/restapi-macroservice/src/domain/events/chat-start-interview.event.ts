import type { ChatMessage } from "../models/chat-message";
import type { ContextDto } from "../models/context.dto";

export class ChatStartInterviewEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {}
}
