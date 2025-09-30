import type { ListingDto } from "src/domain/models/listing.dto";

import { Query } from "@nestjs/cqrs";

export class FetchOlxQuery extends Query<ListingDto[]> {
  constructor(
    public readonly query: string,
    public readonly limit = 40,
    public readonly offset = 0,
  ) {
    super();
  }
}
