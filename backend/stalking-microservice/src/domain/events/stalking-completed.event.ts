import type { AnyProfileScrapeResult } from "../models/profile-scrape-result.model";

export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly completedAt: Date,
    public readonly chatId: string,
    public readonly profiles: AnyProfileScrapeResult[],
  ) {}
}
