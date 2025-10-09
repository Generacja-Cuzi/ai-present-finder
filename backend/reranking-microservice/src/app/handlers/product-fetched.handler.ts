import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";

import { ProductFetchedEvent } from "../../domain/events/product-fetched.event";
import { EventTrackingService } from "../services/event-tracking.service";
import { SessionCompletionService } from "../services/session-completion.service";

@ApiTags("ProductFetched")
@Controller()
export class ProductFetchedHandler {
  private readonly logger = new Logger(ProductFetchedHandler.name);

  constructor(
    private readonly eventTrackingService: EventTrackingService,
    private readonly sessionCompletionService: SessionCompletionService,
  ) {}

  @EventPattern(ProductFetchedEvent.name)
  async handle(event: ProductFetchedEvent) {
    this.logger.log(
      `Handling ProductFetchedEvent from ${event.provider} for chat ${event.chatId}`,
    );
    const eventId = event.eventUuid;

    const sessionId = await this.eventTrackingService.createSessionIfNotExists(
      eventId,
      event.chatId,
      event.totalEvents,
    );

    this.sessionCompletionService.addProductsToSession(
      sessionId,
      event.products,
    );

    const { completed } =
      await this.eventTrackingService.incrementSessionCompletion(sessionId);
    if (completed) {
      await this.sessionCompletionService.emitSessionProducts(sessionId);
    }
  }
}
