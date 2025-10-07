interface ProfileScrapeResult {
  source: string;
  url: string;
  fetchedAt: string;
  raw: unknown;
}

export class StalkingCompletedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profiles: ProfileScrapeResult[],
  ) {}
}
