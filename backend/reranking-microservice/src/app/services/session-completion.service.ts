import { GiftReadyEvent } from "@core/events";
import type { ListingDto } from "@core/types";
import { Repository } from "typeorm";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

import { GiftSession } from "../../domain/entities/gift-session.entity";

@Injectable()
export class SessionCompletionService {
  private readonly logger = new Logger(SessionCompletionService.name);

  private readonly sessionProducts = new Map<string, ListingDto[]>();

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  addProductsToSession(sessionId: string, products: ListingDto[]): void {
    const existingProducts = this.sessionProducts.get(sessionId) ?? [];
    existingProducts.push(...products);
    this.sessionProducts.set(sessionId, existingProducts);

    this.logger.log(
      `Added ${String(products.length)} products to session ${sessionId}, ` +
        `total: ${String(existingProducts.length)}`,
    );
  }

  async emitSessionProducts(sessionId: string): Promise<void> {
    const allProducts = this.sessionProducts.get(sessionId) ?? [];

    // Fetch the session from database to get chatId
    const session = await this.giftSessionRepository.findOne({
      where: { sessionId },
    });

    if (session === null) {
      this.logger.error(`Session ${sessionId} not found in database`);
      return;
    }

    const chatId = session.chatId;

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

    this.removeSession(sessionId);
  }

  private removeSession(sessionId: string): void {
    this.sessionProducts.delete(sessionId);
  }
}
