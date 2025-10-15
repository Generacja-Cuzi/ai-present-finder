import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateSessionCommand } from "../../domain/commands/create-session.command";
import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand, string>
{
  private readonly logger = new Logger(CreateSessionHandler.name);

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  async execute(command: CreateSessionCommand): Promise<string> {
    const { eventId, chatId, totalEvents } = command;

    await this.giftSessionRepository
      .createQueryBuilder()
      .insert()
      .into(GiftSession)
      .values({
        eventId,
        chatId,
        status: SessionStatus.ACTIVE,
        completedEvents: 0,
        totalEvents,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .orIgnore()
      .execute();

    this.logger.log(
      `Session ${eventId} ensured for chat ${chatId} with ${String(totalEvents)} events`,
    );

    return eventId;
  }
}
