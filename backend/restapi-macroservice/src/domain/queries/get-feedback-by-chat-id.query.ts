import { Query } from "@nestjs/cqrs";

import type { Feedback } from "../entities/feedback.entity";

export class GetFeedbackByChatIdQuery extends Query<Feedback[]> {
  constructor(public readonly chatId: string) {
    super();
  }
}
