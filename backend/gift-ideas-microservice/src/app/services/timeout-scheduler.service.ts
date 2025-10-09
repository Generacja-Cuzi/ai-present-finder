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
    this.logger.debug("Checking for sessions older than 2 minutes...");

    try {
      const oldSessions =
        await this.eventTrackingService.getActiveSessionsOlderThan(12);

      if (oldSessions.length > 0) {
        this.logger.log(
          `Found ${String(oldSessions.length)} sessions older than 2 minutes, timing them out`,
        );

        for (const session of oldSessions) {
          await this.eventTrackingService.markSessionTimeout(session.sessionId);

          await this.eventTrackingService.markTimeoutEvents();

          this.sessionCompletionService.checkAndEmitCompletedSessions([
            session.sessionId,
          ]);

          this.logger.log(
            `Session ${session.sessionId} processed after timeout`,
          );
        }
      } else {
        this.logger.debug("No sessions older than 2 minutes found");
      }
    } catch (error) {
      this.logger.error("Error while checking for timeouts:", error);
    }
  }
}
