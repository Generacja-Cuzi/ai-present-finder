import { GiftReadyEvent } from "@core/events";
import { Repository } from "typeorm";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

import { EmitGiftReadyCommand } from "../../domain/commands/emit-gift-ready.command";
import { GiftSession } from "../../domain/entities/gift-session.entity";
import { AddProductsToSessionHandler } from "./add-products-to-session.handler";

@CommandHandler(EmitGiftReadyCommand)
export class EmitGiftReadyHandler
  implements ICommandHandler<EmitGiftReadyCommand, void>
{
  private readonly logger = new Logger(EmitGiftReadyHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    private readonly productsHandler: AddProductsToSessionHandler,
  ) {}

  async execute(command: EmitGiftReadyCommand): Promise<void> {
    const { eventId } = command;

    const allProducts = this.productsHandler.getSessionProducts(eventId);

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

    this.productsHandler.clearSessionProducts(eventId);
  }
}
