import { GiftReadyEvent } from "@core/events";
import type { ListingDto } from "@core/types";
import { Repository } from "typeorm";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

import { EmitGiftReadyCommand } from "../../domain/commands/emit-gift-ready.command";
import { GiftSessionProduct } from "../../domain/entities/gift-session-product.entity";
import { GiftSession } from "../../domain/entities/gift-session.entity";

@CommandHandler(EmitGiftReadyCommand)
export class EmitGiftReadyHandler
  implements ICommandHandler<EmitGiftReadyCommand, void>
{
  private readonly logger = new Logger(EmitGiftReadyHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
    @InjectRepository(GiftSessionProduct)
    private readonly giftSessionProductRepository: Repository<GiftSessionProduct>,
  ) {}

  async execute(command: EmitGiftReadyCommand): Promise<void> {
    const { eventId } = command;

    const session = await this.giftSessionRepository.findOne({
      where: { eventId },
    });

    if (session === null) {
      this.logger.error(`Session ${eventId} not found in database`);
      return;
    }

    const productRows = await this.giftSessionProductRepository.find({
      where: { session: { eventId } },
      relations: ["product"],
      order: { createdAt: "ASC" },
    });

    const allProducts = productRows.map((row) => ({
      image: row.product.image,
      title: row.product.title,
      description: row.product.description,
      link: row.product.link,
      price: {
        value: row.product.priceValue,
        label: row.product.priceLabel,
        currency: row.product.priceCurrency,
        negotiable: row.product.priceNegotiable,
      },
    })) satisfies ListingDto[];

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
  }
}
