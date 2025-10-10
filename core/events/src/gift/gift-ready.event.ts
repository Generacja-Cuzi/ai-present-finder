import type { ListingDto } from "@core/types";

export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: ListingDto[],
    public readonly chatId: string,
  ) {}
}
