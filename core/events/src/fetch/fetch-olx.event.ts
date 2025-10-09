export class FetchOlxEvent {
  constructor(
    public readonly query: string,
    public readonly limit = 20,
    public readonly offset = 0,
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly totalEvents: number,
  ) {}
}
