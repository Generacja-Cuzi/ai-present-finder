import type { ListingPayload } from "@core/types";

export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: ListingPayload[],
    public readonly chatId: string,
  ) {}
}
