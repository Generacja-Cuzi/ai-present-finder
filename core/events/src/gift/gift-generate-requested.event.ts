import type { EndConversationOutput } from "@core/types";

export class GiftGenerateRequestedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
