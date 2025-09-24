export class FetchAmazonQuery {
  constructor(
    public readonly query: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
    public readonly country: string = 'PL',
    public readonly page: number = 1,
  ) {}
}
