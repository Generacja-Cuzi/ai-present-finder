import { Injectable, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Cron, CronExpression } from "@nestjs/schedule";

import { EmitGiftReadyCommand } from "../../domain/commands/emit-gift-ready.command";
import { MarkTimeoutSessionsCommand } from "../../domain/commands/mark-timeout-sessions.command";

@Injectable()
export class TimeoutSchedulerService {
  private readonly logger = new Logger(TimeoutSchedulerService.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleTimeouts() {
    this.logger.debug("Checking for timed out events...");

    try {
      const sessionIds = await this.commandBus.execute<
        MarkTimeoutSessionsCommand,
        string[]
      >(new MarkTimeoutSessionsCommand());

      if (sessionIds.length > 0) {
        this.logger.log(
          `Marked ${String(sessionIds.length)} sessions as timed out`,
        );

        for (const sessionId of sessionIds) {
          await this.commandBus.execute(new EmitGiftReadyCommand(sessionId));
        }
      } else {
        this.logger.debug("No timed out events found");
      }
    } catch (error) {
      this.logger.error("Error while checking for timeouts:", error);
    }
  }
}
