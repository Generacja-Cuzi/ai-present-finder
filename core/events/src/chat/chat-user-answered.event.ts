import type { ChatMessage } from "@core/types";

export class ChatUserAnsweredEvent {
  constructor(
    public readonly chatId: string,
    public readonly messages: ChatMessage[],
  ) {}
}
