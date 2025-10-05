export class FetchAllegroRequestedEvent {
  constructor(
    public readonly query: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
