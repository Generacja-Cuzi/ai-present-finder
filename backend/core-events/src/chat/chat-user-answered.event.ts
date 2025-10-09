import type { ChatMessage } from "../types";
import type { ContextDto } from "../types";

export class ChatUserAnsweredEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly messages: ChatMessage[],
  ) {}
}
