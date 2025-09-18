export class FetchOlxDto {
  query!: string;
  limit?: number = 40;
  offset?: number = 0;
}
