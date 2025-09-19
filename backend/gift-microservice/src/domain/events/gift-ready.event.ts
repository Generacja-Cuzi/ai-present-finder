import { ListingDto } from "../models/listing.dto";

export class GiftReadyEvent {
  constructor(
    public readonly giftIdeas: ListingDto[],
    public readonly chatId: string,
  ) {}
}
