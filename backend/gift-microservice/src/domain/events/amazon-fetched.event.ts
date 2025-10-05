import type { ListingDto } from "../models/listing.dto";

export class AmazonFetchedEvent {
  constructor(public readonly results: ListingDto[]) {}
}
