import { ProgressUpdateEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ProgressUpdateHandler {
  private readonly logger = new Logger(ProgressUpdateHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ProgressUpdateEvent.name)
  async handle(event: ProgressUpdateEvent) {
    this.logger.log(
      `Handling ProgressUpdateEvent for chat ${event.chatId}: ${event.stage} - ${String(event.percentage)}%`,
    );

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "progress-update",
        stage: event.stage,
        percentage: event.percentage,
        message: event.message,
      }),
    );

    this.logger.log(
      `Sent progress update via SSE for chat ${event.chatId}: ${event.message}`,
    );
  }
}
