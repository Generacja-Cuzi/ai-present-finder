import { GiftReadyEvent } from "@core/events";
import type { ListingPayload } from "@core/types";

import { Inject, Logger } from "@nestjs/common";
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { EmitGiftReadyCommand } from "../../domain/commands/emit-gift-ready.command";
import { UpdateProductRatingsCommand } from "../../domain/commands/update-product-ratings.command";
import { GetSessionProductsQuery } from "../../domain/queries/get-session-products.query";
import type { SessionProductsResult } from "../../domain/queries/get-session-products.query";
import { ScoreProductsQuery } from "../../domain/queries/score-products.query";
import { ProductScore } from "../ai/types";

@CommandHandler(EmitGiftReadyCommand)
export class EmitGiftReadyHandler
  implements ICommandHandler<EmitGiftReadyCommand, void>
{
  private readonly logger = new Logger(EmitGiftReadyHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: EmitGiftReadyCommand): Promise<void> {
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

      await this.commandBus.execute(
        new UpdateProductRatingsCommand(allProducts, scoredProducts, eventId),
      );

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
        allProducts.map(
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
            }) satisfies ListingPayload,
        ),
        chatId,
        profile,
      );
      this.giftReadyEventBus.emit(GiftReadyEvent.name, giftReadyEvent);

      this.logger.log(
        `Emitted GiftReadyEvent with ${String(scoredProducts.length)} ranked products for session ${eventId}`,
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
