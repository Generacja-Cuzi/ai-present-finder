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
import { Product } from "../../domain/entities/product.entity";
import { rankProducts } from "../ai/ranking.service";

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
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

    const productGroups = await this.giftSessionProductRepository.find({
      where: { session: { eventId } },
      relations: ["products"],
      order: { createdAt: "ASC" },
    });

    const productEntityMap = new Map<string, Product>();
    for (const group of productGroups) {
      for (const product of group.products) {
        productEntityMap.set(product.link, product);
      }
    }

    const allProducts = productGroups.flatMap((group) =>
      group.products.map((product) => ({
        image: product.image,
        title: product.title,
        description: product.description,
        link: product.link,
        price: {
          value: product.priceValue,
          label: product.priceLabel,
          currency: product.priceCurrency,
          negotiable: product.priceNegotiable,
        },
      })),
    ) satisfies ListingDto[];

    const chatId = session.chatId;

    if (allProducts.length > 0) {
      const recipientProfile = session.giftContext?.userProfile ?? null;
      const keywords = session.giftContext?.keywords ?? [];

      this.logger.log(
        `Ranking ${String(allProducts.length)} products with AI for session ${eventId}`,
      );

      const rankedProductsWithScores = await rankProducts({
        products: allProducts,
        recipientProfile,
        keywords,
      });

      this.logger.log(
        `AI ranking completed for session ${eventId}. Top score: ${String(rankedProductsWithScores[0]?.score ?? "N/A")}`,
      );

      // Update existing products with ratings and reasoning
      const productsToUpdate: Product[] = [];
      for (const rankedProduct of rankedProductsWithScores) {
        const productEntity = productEntityMap.get(rankedProduct.link);
        if (productEntity !== undefined) {
          productEntity.rating = rankedProduct.score;
          productEntity.reasoning = rankedProduct.reasoning;
          productsToUpdate.push(productEntity);
        }
      }

      if (productsToUpdate.length > 0) {
        await this.productRepository.save(productsToUpdate);
        this.logger.log(
          `Updated ${String(productsToUpdate.length)} products with ratings and reasoning in session ${eventId}`,
        );
      }

      const giftReadyEvent = new GiftReadyEvent(
        rankedProductsWithScores,
        chatId,
      );
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);

      this.logger.log(
        `Emitted GiftReadyEvent with ${String(rankedProductsWithScores.length)} ranked products for session ${eventId}`,
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
