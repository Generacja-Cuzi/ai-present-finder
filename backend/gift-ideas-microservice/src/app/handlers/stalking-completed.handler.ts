import { StalkingCompletedEvent } from "@core/events";
import { UpdateStalkingStatusCommand } from "src/domain/commands/update-stalking-status.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class StalkingCompletedHandler {
  private readonly logger = new Logger(StalkingCompletedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(StalkingCompletedEvent.name)
  async handle(event: StalkingCompletedEvent) {
    this.logger.log(
      `Handling stalking completed event for chat ${event.chatId}`,
    );

    await this.commandBus.execute(
      new UpdateStalkingStatusCommand(event.chatId, event.keywords),
    );
  }
}
