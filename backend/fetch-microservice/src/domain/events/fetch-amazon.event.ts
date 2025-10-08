export class FetchAmazonEvent {
  constructor(
    public readonly query: string,
    public readonly limit = 20,
    public readonly offset = 0,
    public readonly country = "PL",
    public readonly page = 1,
    public readonly requestId: string,
    public readonly chatId: string,
  ) {}
}
