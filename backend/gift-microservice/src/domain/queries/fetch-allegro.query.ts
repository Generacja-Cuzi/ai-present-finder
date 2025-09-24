export class FetchAllegroQuery {
  constructor(
    public readonly query: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
