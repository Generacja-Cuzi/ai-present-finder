import type { ListingDto } from "../types";

export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: ListingDto[],
    public readonly chatId: string,
  ) {}
}
