import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { InitializeGiftContextCommand } from "../../domain/commands/initialize-gift-context.command";
import {
  GiftSession,
  SessionStatus,
} from "../../domain/entities/gift-session.entity";

@CommandHandler(InitializeGiftContextCommand)
export class InitializeGiftContextHandler
  implements ICommandHandler<InitializeGiftContextCommand, void>
{
  private readonly logger = new Logger(InitializeGiftContextHandler.name);

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  async execute(command: InitializeGiftContextCommand): Promise<void> {
    const {
      eventId,
      chatId,
      totalEvents,
      userProfile,
      keywords,
      saveProfile,
      profileName,
    } = command;

    const existingSession = await this.giftSessionRepository.findOne({
      where: { eventId },
    });

    if (existingSession === null) {
      await this.giftSessionRepository.save({
        eventId,
        chatId,
        status: SessionStatus.ACTIVE,
        completedEvents: 0,
        totalEvents,
        giftContext: {
          userProfile,
          keywords,
          saveProfile,
          profileName,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.logger.log(
        `Created session ${eventId} with gift context for chat ${chatId}`,
      );
    } else {
      await this.giftSessionRepository.update(eventId, {
        giftContext: {
          userProfile,
          keywords,
          saveProfile,
          profileName,
        },
        updatedAt: new Date(),
      });
      this.logger.log(`Updated gift context for existing session ${eventId}`);
    }
  }
}
