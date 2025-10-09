import { GiftReadyEvent } from "src/domain/events/gift-ready.event";
import type { ListingDto } from "src/domain/models/listing.dto";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

import { EventTrackingService } from "./event-tracking.service";

export interface SessionInfo {
  sessionId: string;
  chatId: string;
}

@Injectable()
export class SessionCompletionService {
  private readonly logger = new Logger(SessionCompletionService.name);

  // Store session info for timeout completion
  private readonly sessionInfoMap = new Map<string, SessionInfo>();

  // Store collected products for each session
  private readonly sessionProducts = new Map<string, ListingDto[]>();

  constructor(
    private readonly eventTrackingService: EventTrackingService,
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
  ) {}

  registerSession(sessionId: string, chatId: string): void {
    this.sessionInfoMap.set(sessionId, { sessionId, chatId });
    this.logger.log(`Registered session ${sessionId} for chat ${chatId}`);
  }

  getSessionInfo(sessionId: string): SessionInfo | undefined {
    return this.sessionInfoMap.get(sessionId);
  }

  async checkCompletedSessions(sessionIds: string[]): Promise<SessionInfo[]> {
    const completedSessions: SessionInfo[] = [];

    for (const sessionId of sessionIds) {
      const isComplete =
        await this.eventTrackingService.checkAndEmitCompletedSession(sessionId);
      if (isComplete) {
        const sessionInfo = this.sessionInfoMap.get(sessionId);
        if (sessionInfo !== undefined) {
          completedSessions.push(sessionInfo);
          // Clean up completed session
          this.sessionInfoMap.delete(sessionId);
        }
      }
    }

    return completedSessions;
  }

  removeSession(sessionId: string): void {
    this.sessionInfoMap.delete(sessionId);
    this.sessionProducts.delete(sessionId);
  }

  addProductsToSession(sessionId: string, products: ListingDto[]): void {
    const existingProducts = this.sessionProducts.get(sessionId) ?? [];
    existingProducts.push(...products);
    this.sessionProducts.set(sessionId, existingProducts);

    this.logger.log(
      `Added ${String(products.length)} products to session ${sessionId}, ` +
        `total: ${String(existingProducts.length)}`,
    );
  }

  emitSessionProducts(sessionId: string, chatId: string): void {
    const allProducts = this.sessionProducts.get(sessionId) ?? [];

    if (allProducts.length > 0) {
      const giftReadyEvent = new GiftReadyEvent(allProducts, chatId);
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);

      this.logger.log(
        `Emitted GiftReadyEvent with ${String(allProducts.length)} products for session ${sessionId}`,
      );
    } else {
      this.logger.warn(
        `No products found for session ${sessionId}, emitting empty event`,
      );
      const giftReadyEvent = new GiftReadyEvent([], chatId);
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);
    }

    // Clean up after emission
    this.removeSession(sessionId);
  }

  checkAndEmitCompletedSessions(sessionIds: string[]): void {
    for (const sessionId of sessionIds) {
      const sessionInfo = this.sessionInfoMap.get(sessionId);
      this.logger.log(`Checking session ${sessionId} for completion`);
      this.logger.log(`Session info: ${JSON.stringify(sessionInfo)}`);
      if (sessionInfo !== undefined) {
        this.emitSessionProducts(sessionId, sessionInfo.chatId);
        this.logger.log(`Session ${sessionId} completed and products emitted`);
      }
    }
  }
}
