export class FetchOlxQuery {
  constructor(
    public readonly query: string,
    public readonly limit = 40,
    public readonly offset = 0,
  ) {}
}
