import { EventTrackingService } from "src/app/services/event-tracking.service";
import { SessionCompletionService } from "src/app/services/session-completion.service";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";
import { ProductFetchedEvent } from "src/domain/events/product-fetched.event";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientProxy, EventPattern } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("ProductFetched")
@Controller()
export class ProductFetchedHandler {
  private readonly logger = new Logger(ProductFetchedHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    private readonly eventTrackingService: EventTrackingService,
    private readonly sessionCompletionService: SessionCompletionService,
  ) {}

  @EventPattern(ProductFetchedEvent.name)
  async handle(event: ProductFetchedEvent) {
    this.logger.log(
      `Handling ProductFetchedEvent from ${event.provider} for chat ${event.chatId}`,
    );

    let sessionId: string | null = null;

    // Mark event as completed if it has an eventUuid and get sessionId
    if (event.eventUuid?.trim() !== "" && event.eventUuid !== undefined) {
      const marked = await this.eventTrackingService.markEventCompleted(
        event.eventUuid,
      );
      if (marked) {
        // Get sessionId from the completed event
        sessionId = await this.eventTrackingService.getSessionIdByEventUuid(
          event.eventUuid,
        );
      } else {
        this.logger.warn(
          `Failed to mark event ${event.eventUuid} as completed`,
        );
        return; // Exit if we can't track this event
      }
    }

    // Store products for this session if successful
    if (
      event.success &&
      event.products.length > 0 &&
      sessionId !== null &&
      sessionId.trim() !== ""
    ) {
      this.sessionCompletionService.addProductsToSession(
        sessionId,
        event.products,
      );
    }

    // If we have a sessionId, check if session is complete and emit if so
    if (sessionId !== null && sessionId.trim() !== "") {
      await this.checkSessionAndEmitIfComplete(sessionId, event.chatId);
    } else {
      // Fallback: emit immediately if no UUID tracking (backward compatibility)
      this.logger.warn("No eventUuid provided, falling back to immediate emit");
      if (event.success) {
        const giftReadyEvent = new GiftReadyEvent(event.products, event.chatId);
        this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);
      }
    }
  }

  private async checkSessionAndEmitIfComplete(
    sessionId: string,
    chatId: string,
  ) {
    const sessionStatus =
      await this.eventTrackingService.getSessionStatus(sessionId);

    this.logger.log(
      `Session ${sessionId} status: ${String(sessionStatus.completed)}/${String(sessionStatus.total)} completed, ` +
        `${String(sessionStatus.pending)} pending, ${String(sessionStatus.timedOut)} timed out`,
    );

    // Session is complete when all events are either completed or timed out (no pending)
    if (sessionStatus.pending === 0) {
      this.logger.log(
        `Session ${sessionId} is complete, emitting aggregated results`,
      );

      // Emit products using SessionCompletionService
      this.sessionCompletionService.emitSessionProducts(sessionId, chatId);
    } else {
      this.logger.log(
        `Session ${sessionId} not complete yet, waiting for ${String(sessionStatus.pending)} more events`,
      );
    }
  }
}
