import { GiftContextInitializedEvent } from "@core/events";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

import { InitializeGiftContextCommand } from "../../domain/commands/initialize-gift-context.command";

@Controller()
export class GiftContextInitializedHandler {
  private readonly logger = new Logger(GiftContextInitializedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GiftContextInitializedEvent.name)
  async handle(event: GiftContextInitializedEvent) {
    this.logger.log(
      `Handling GiftContextInitializedEvent for chat ${event.chatId}`,
    );
    this.logger.log(
      `Event data: saveProfile=${String(event.saveProfile)}, profileName=${String(event.profileName)}, keywords=${JSON.stringify(event.keywords)}`,
    );

    await this.commandBus.execute(
      new InitializeGiftContextCommand(
        event.eventId,
        event.chatId,
        event.totalEvents,
        event.userProfile,
        event.keywords,
        event.saveProfile,
        event.profileName,
      ),
    );
  }
}
