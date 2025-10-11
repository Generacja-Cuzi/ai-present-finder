import type { EndConversationOutput } from "@core/types";

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly chatId: string,
    public readonly profile: EndConversationOutput,
  ) {}
}
