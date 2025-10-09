import type { ListingDto } from "../models/listing.dto";

export class ProductFetchedEvent {
  constructor(
    public readonly products: ListingDto[],
    public readonly requestId: string,
    public readonly chatId: string,
    public readonly provider: string, // "allegro", "amazon", "ebay", "olx"
    public readonly success: boolean,
    public readonly eventUuid?: string, // UUID for tracking
    public readonly error?: string,
  ) {}
}
