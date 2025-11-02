import type { Feedback } from "src/domain/entities/feedback.entity";
import { GetFeedbackByChatIdQuery } from "src/domain/queries/get-feedback-by-chat-id.query";
import { IFeedbackRepository } from "src/domain/repositories/ifeedback.repository";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetFeedbackByChatIdQuery)
export class GetFeedbackByChatIdHandler
  implements IQueryHandler<GetFeedbackByChatIdQuery>
{
  constructor(private readonly feedbackRepository: IFeedbackRepository) {}

  async execute(query: GetFeedbackByChatIdQuery): Promise<Feedback | null> {
    return this.feedbackRepository.findByChatId(query.chatId);
  }
}
