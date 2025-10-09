export class FetchAllegroEvent {
  constructor(
    public readonly query: string,
    public readonly limit = 20,
    public readonly offset = 0,
    public readonly requestId: string,
    public readonly chatId: string,
    public readonly eventUuid: string,
    public readonly totalEvents: number,
  ) {}
}
