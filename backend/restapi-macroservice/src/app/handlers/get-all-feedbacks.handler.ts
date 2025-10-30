import type { Feedback } from "src/domain/entities/feedback.entity";
import { GetAllFeedbacksQuery } from "src/domain/queries/get-all-feedbacks.query";
import { IFeedbackRepository } from "src/domain/repositories/ifeedback.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetAllFeedbacksQuery)
export class GetAllFeedbacksHandler
  implements IQueryHandler<GetAllFeedbacksQuery>
{
  constructor(private readonly feedbackRepository: IFeedbackRepository) {}

  async execute(query: GetAllFeedbacksQuery): Promise<Feedback[]> {
    return this.feedbackRepository.findAll();
  }
}
