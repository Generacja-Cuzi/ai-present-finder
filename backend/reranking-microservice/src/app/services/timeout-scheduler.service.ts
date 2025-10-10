import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { EventTrackingService } from "./event-tracking.service";
import { SessionCompletionService } from "./session-completion.service";

@Injectable()
export class TimeoutSchedulerService {
  private readonly logger = new Logger(TimeoutSchedulerService.name);

  constructor(
    private readonly eventTrackingService: EventTrackingService,
    private readonly sessionCompletionService: SessionCompletionService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleTimeouts() {
    this.logger.debug("Checking for timed out events...");

    try {
      const sessionIds = await this.eventTrackingService.markTimeoutEvents();

      if (sessionIds.length > 0) {
        this.logger.log(
          `Marked ${String(sessionIds.length)} sessions as timed out`,
        );

        for (const sessionId of sessionIds) {
          await this.sessionCompletionService.emitSessionProducts(sessionId);
        }
      } else {
        this.logger.debug("No timed out events found");
      }
    } catch (error) {
      this.logger.error("Error while checking for timeouts:", error);
    }
  }
}
