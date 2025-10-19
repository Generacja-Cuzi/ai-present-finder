import { Query } from "@nestjs/cqrs";

export class GetOccasionQuery extends Query<string | null> {
  constructor(public readonly chatId: string) {
    super();
  }
}
