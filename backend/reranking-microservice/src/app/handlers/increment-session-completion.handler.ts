import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { IncrementSessionCompletionCommand } from "../../domain/commands/increment-session-completion.command";
import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@CommandHandler(IncrementSessionCompletionCommand)
export class IncrementSessionCompletionHandler
  implements
    ICommandHandler<IncrementSessionCompletionCommand, { completed: boolean }>
{
  private readonly logger = new Logger(IncrementSessionCompletionHandler.name);

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  async execute(
    command: IncrementSessionCompletionCommand,
  ): Promise<{ completed: boolean }> {
    const { eventId } = command;

    return this.giftSessionRepository.manager.transaction(async (manager) => {
      const now = new Date();
      await manager.increment(GiftSession, { eventId }, "completedEvents", 1);
      await manager.update(GiftSession, { eventId }, { updatedAt: now });
      const session = await manager.findOne(GiftSession, {
        where: { eventId },
      });

      this.logger.log(
        `Session ${eventId} completedEvents: ${session?.completedEvents.toString() ?? "---"}/${session?.totalEvents.toString() ?? "---"}`,
      );

      if (session !== null && session.completedEvents >= session.totalEvents) {
        await manager.update(
          GiftSession,
          { eventId },
          { status: SessionStatus.COMPLETED, updatedAt: now },
        );
        this.logger.log(`Session ${eventId} marked as completed`);
        return { completed: true };
      }

      return { completed: false };
    });
  }
}
