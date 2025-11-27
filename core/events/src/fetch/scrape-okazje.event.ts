export class ScrapeOkazjeEvent {
  constructor(
    public readonly query: string,
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly totalEvents: number,
  ) {}
}
