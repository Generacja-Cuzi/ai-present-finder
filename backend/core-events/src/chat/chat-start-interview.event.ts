import type { ChatMessage } from "../types";
import type { ContextDto } from "../types";

export class ChatStartInterviewEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {}
}
