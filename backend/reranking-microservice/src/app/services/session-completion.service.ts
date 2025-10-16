import { GiftReadyEvent } from "@core/events";
import type { ListingPayload } from "@core/types";
import { Repository } from "typeorm";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

import { GiftSession } from "../../domain/entities/gift-session.entity";

@Injectable()
export class SessionCompletionService {
  private readonly logger = new Logger(SessionCompletionService.name);

  private readonly sessionProducts = new Map<string, ListingPayload[]>();

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  addProductsToSession(eventId: string, products: ListingPayload[]): void {
    const existingProducts = this.sessionProducts.get(eventId) ?? [];
    existingProducts.push(...products);
    this.sessionProducts.set(eventId, existingProducts);

    this.logger.log(
      `Added ${String(products.length)} products to session ${eventId}, ` +
        `total: ${String(existingProducts.length)}`,
    );
  }

  async emitSessionProducts(eventId: string): Promise<void> {
    const allProducts = this.sessionProducts.get(eventId) ?? [];

    // Fetch the session from database to get chatId
    const session = await this.giftSessionRepository.findOne({
      where: { eventId },
    });

    if (session === null) {
      this.logger.error(`Session ${eventId} not found in database`);
      return;
    }

    const chatId = session.chatId;

    if (allProducts.length > 0) {
      const giftReadyEvent = new GiftReadyEvent(allProducts, chatId);
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);

      this.logger.log(
        `Emitted GiftReadyEvent with ${String(allProducts.length)} products for session ${eventId}`,
      );
    } else {
      this.logger.warn(
        `No products found for session ${eventId}, emitting empty event`,
      );
      const giftReadyEvent = new GiftReadyEvent([], chatId);
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);
    }

    this.removeSession(eventId);
  }

  private removeSession(eventId: string): void {
    this.sessionProducts.delete(eventId);
  }
}
