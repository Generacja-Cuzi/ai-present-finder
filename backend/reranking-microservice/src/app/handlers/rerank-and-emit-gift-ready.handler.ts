import { GiftReadyEvent } from "@core/events";
import type { ListingPayload } from "@core/types";
import { Product } from "src/domain/entities/product.entity";

import { Inject, Logger } from "@nestjs/common";
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { RerankAndEmitGiftReadyCommand } from "../../domain/commands/rerank-and-emit-gift-ready.command";
import { UpdateProductRatingsCommand } from "../../domain/commands/update-product-ratings.command";
import { GetSessionProductsQuery } from "../../domain/queries/get-session-products.query";
import type { SessionProductsResult } from "../../domain/queries/get-session-products.query";
import { ScoreProductsQuery } from "../../domain/queries/score-products.query";
import { ProductScore } from "../ai/types";

@CommandHandler(RerankAndEmitGiftReadyCommand)
export class RerankAndEmitGiftReadyHandler
  implements ICommandHandler<RerankAndEmitGiftReadyCommand, void>
{
  private readonly logger = new Logger(RerankAndEmitGiftReadyHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RerankAndEmitGiftReadyCommand): Promise<void> {
    const { eventId } = command;

    const sessionProductsResult =
      await this.queryBus.execute<SessionProductsResult | null>(
        new GetSessionProductsQuery(eventId),
      );

    if (sessionProductsResult === null) {
      return;
    }

    const { session, allProducts } = sessionProductsResult;
    const chatId = session.chatId;

    if (allProducts.length > 0) {
      const recipientProfile = session.giftContext?.userProfile ?? null;
      const keywords = session.giftContext?.keywords ?? [];

      const scoredProducts = await this.queryBus.execute<ProductScore[]>(
        new ScoreProductsQuery(
          allProducts,
          recipientProfile,
          keywords,
          eventId,
        ),
      );

      const updatedProducts = await this.commandBus.execute(
        new UpdateProductRatingsCommand(allProducts, scoredProducts, eventId),
      );

      const goodProducts: (Product & { rating: number })[] =
        updatedProducts.filter(
          (p): p is Product & { rating: number } =>
            p.rating !== null && p.rating >= 5,
        );
      goodProducts.sort((a, b) => b.rating - a.rating);

      // Build profile for GiftReadyEvent if we have all the data
      const profile =
        recipientProfile !== null &&
        session.giftContext?.saveProfile !== undefined &&
        session.giftContext.profileName !== undefined
          ? {
              recipient_profile: recipientProfile,
              key_themes_and_keywords: keywords,
              save_profile: session.giftContext.saveProfile,
              profile_name: session.giftContext.profileName,
            }
          : undefined;

      this.logger.log(
        `Constructed profile for GiftReadyEvent: ${JSON.stringify(profile)}`,
      );

      const giftReadyEvent = new GiftReadyEvent(
        // Take only the best 50 products
        goodProducts.slice(0, 50).map(
          (p) =>
            ({
              image: p.image,
              title: p.title,
              description: p.description,
              link: p.link,
              price: {
                value: p.priceValue,
                label: p.priceLabel,
                currency: p.priceCurrency,
                negotiable: p.priceNegotiable,
              },
              category: p.category,
              provider: p.provider,
            }) satisfies ListingPayload,
        ),
        chatId,
        profile,
      );
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);

      this.logger.log(
        `Emitted GiftReadyEvent with ${String(scoredProducts.length)} ranked products for session ${eventId}`,
      );
    }
  }
}
