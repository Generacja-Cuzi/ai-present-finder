import { Query } from "@nestjs/cqrs";

import type { Feedback } from "../entities/feedback.entity";

export class GetAllFeedbacksQuery extends Query<Feedback[]> {
  constructor() {
    super();
  }
}
