import type { ChatMessage } from "@core/types";
import type { ContextDto } from "@core/types";

export class ChatUserAnsweredEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly messages: ChatMessage[],
  ) {}
}
