import type { GiftIdeasOutput } from "src/app/ai/types";

import { Command } from "@nestjs/cqrs";

export class EmitFetchEventsCommand extends Command<number> {
  constructor(
    public readonly searchQueries: GiftIdeasOutput["search_queries"],
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly totalEvents: number,
    public readonly minPrice?: number | null,
    public readonly maxPrice?: number | null,
  ) {
    super();
  }
}
