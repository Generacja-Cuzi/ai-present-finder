import type { ChatMessage } from "@core/types";
import type { ContextDto } from "@core/types";

export class ChatStartInterviewEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {}
}
