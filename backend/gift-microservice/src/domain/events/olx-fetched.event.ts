import type { ListingDto } from "../models/listing.dto";

export class OlxFetchedEvent {
  constructor(public readonly results: ListingDto[]) {}
}
