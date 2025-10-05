import type { ListingDto } from "../models/listing.dto";

export class AllegroFetchedEvent {
  constructor(public readonly results: ListingDto[]) {}
}
