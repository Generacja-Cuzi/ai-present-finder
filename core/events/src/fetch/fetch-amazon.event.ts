export class FetchAmazonEvent {
  constructor(
    public readonly query: string,
    public readonly limit = 20,
    public readonly offset = 0,
    public readonly country = "PL",
    public readonly page = 1,
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly totalEvents: number,
  ) {}
}
