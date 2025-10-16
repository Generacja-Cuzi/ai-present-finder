import type { ProductFetchedEvent } from "@core/events";
import type { ListingDto } from "@core/types";

type FetchProvider = ProductFetchedEvent["provider"];

export class AddProductsToSessionCommand {
  constructor(
    public readonly eventId: string,
    public readonly products: ListingDto[],
    public readonly sourceEventName: string,
    public readonly sourceEventProvider: FetchProvider,
    public readonly sourceEventSuccess: boolean,
  ) {}
}
