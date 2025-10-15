import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { CreateSessionCommand } from "../../domain/commands/create-session.command";
import { InitializeGiftContextCommand } from "../../domain/commands/initialize-gift-context.command";
import { GiftSession } from "../../domain/entities/gift-session.entity";

@CommandHandler(InitializeGiftContextCommand)
export class InitializeGiftContextHandler
  implements ICommandHandler<InitializeGiftContextCommand, void>
{
  private readonly logger = new Logger(InitializeGiftContextHandler.name);

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: InitializeGiftContextCommand): Promise<void> {
    const { eventId, chatId, totalEvents, userProfile, keywords } = command;

    await this.commandBus.execute(
      new CreateSessionCommand(eventId, chatId, totalEvents),
    );

    await this.giftSessionRepository.update(eventId, {
      giftContext: {
        userProfile,
        keywords,
      },
    });

    this.logger.log(`Saved gift context for session ${eventId}`);
  }
}
