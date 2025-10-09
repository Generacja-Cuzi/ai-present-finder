import type { ListingDto } from "@core/types";

export class ProductFetchedEvent {
  constructor(
    public readonly products: ListingDto[],
    public readonly requestId: string,
    public readonly chatId: string,
    public readonly provider: "allegro" | "amazon" | "ebay" | "olx",
    public readonly success: boolean,
    public readonly eventUuid: string,
    public readonly totalEvents: number,
  ) {}
}
