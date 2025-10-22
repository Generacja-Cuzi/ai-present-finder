import type { ProductFetchedEvent } from "@core/events";
import type { ListingPayload } from "@core/types";

type FetchProvider = ProductFetchedEvent["provider"];

export class AddProductsToSessionCommand {
  constructor(
    public readonly eventId: string,
    public readonly products: ListingPayload[],
    public readonly sourceEventName: string,
    public readonly sourceEventProvider: FetchProvider,
    public readonly sourceEventSuccess: boolean,
  ) {}
}
