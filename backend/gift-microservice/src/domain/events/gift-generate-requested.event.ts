import type { EndConversationOuput } from "../models/end-converstion-ai-output";

export class GiftGenerateRequestedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profile: EndConversationOuput | null,
  ) {}
}
