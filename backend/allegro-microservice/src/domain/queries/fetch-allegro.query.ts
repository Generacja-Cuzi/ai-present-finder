export class FetchAllegroQuery {
  constructor(
    public readonly query: string,
    public readonly limit = 20,
    public readonly offset = 0,
  ) {}
}
