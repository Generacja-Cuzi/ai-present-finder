import type { ListingDto } from "../models/listing.dto";

export class EbayFetchedEvent {
  constructor(public readonly results: ListingDto[]) {}
}
