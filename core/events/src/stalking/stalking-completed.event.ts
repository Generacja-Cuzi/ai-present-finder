import type { AnyProfileScrapeResult } from "@core/types";

export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profiles: AnyProfileScrapeResult[],
    public readonly completedAt: Date = new Date(),
  ) {}
}
