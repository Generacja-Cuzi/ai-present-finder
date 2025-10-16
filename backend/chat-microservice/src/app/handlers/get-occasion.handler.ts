import { ChatSession } from "src/domain/entities/chat-session.entity";
import { GetOccasionQuery } from "src/domain/queries/get-occasion.query";
import { Repository } from "typeorm";

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

@QueryHandler(GetOccasionQuery)
export class GetOccasionHandler implements IQueryHandler<GetOccasionQuery> {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
  ) {}

  async execute(query: GetOccasionQuery): Promise<string | null> {
    const { chatId } = query;

    const session = await this.chatSessionRepository.findOne({
      where: { chatId },
    });

    return session?.occasion ?? null;
  }
}
