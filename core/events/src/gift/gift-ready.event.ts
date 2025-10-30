import type { EndConversationOutput, ListingPayload } from "@core/types";

export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: ListingPayload[],
    public readonly chatId: string,
    public readonly profile?: EndConversationOutput,
  ) {}
}
