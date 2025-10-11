import { GiftContextInitializedEvent } from "@core/events";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

import { EventTrackingService } from "../services/event-tracking.service";

@Controller()
export class GiftContextInitializedHandler {
  private readonly logger = new Logger(GiftContextInitializedHandler.name);

  constructor(private readonly eventTrackingService: EventTrackingService) {}

  @EventPattern(GiftContextInitializedEvent.name)
  async handle(event: GiftContextInitializedEvent) {
    this.logger.log(
      `Handling GiftContextInitializedEvent for chat ${event.chatId}`,
    );

    await this.eventTrackingService.saveGiftContext(
      event.eventId,
      event.chatId,
      event.totalEvents,
      event.userProfile,
      event.keywords,
    );
  }
}
