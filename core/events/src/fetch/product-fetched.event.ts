import type { ListingPayload } from "@core/types";

export class ProductFetchedEvent {
  constructor(
    public readonly products: ListingPayload[],
    public readonly chatId: string,
    public readonly provider: "allegro" | "amazon" | "ebay" | "olx",
    public readonly success: boolean,
    public readonly eventId: string,
    public readonly totalEvents: number,
  ) {}
}
