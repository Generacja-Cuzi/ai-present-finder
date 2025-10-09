import type { EndConversationOutput } from "../models/end-converstion-ai-output";

export class GiftGenerateRequestedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
