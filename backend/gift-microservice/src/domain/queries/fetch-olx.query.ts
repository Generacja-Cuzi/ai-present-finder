export class FetchOlxQuery {
  constructor(
    public readonly query: string,
    public readonly limit: number = 40,
    public readonly offset: number = 0,
  ) {}
}