import { GiftReadyEvent, RegenerateIdeasLoopEvent } from "@core/events";
import type { ListingPayload } from "@core/types";
import { Product } from "src/domain/entities/product.entity";

import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { CheckAndPrepareRegenerateIdeasLoopCommand } from "../../domain/commands/check-and-prepare-regenerate-ideas-loop.command";
import { RerankAndEmitGiftReadyCommand } from "../../domain/commands/rerank-and-emit-gift-ready.command";
import { UpdateProductRatingsCommand } from "../../domain/commands/update-product-ratings.command";
import { GetSessionProductsQuery } from "../../domain/queries/get-session-products.query";
import type { SessionProductsResult } from "../../domain/queries/get-session-products.query";
import { ScoreProductsQuery } from "../../domain/queries/score-products.query";
import { ProductScore } from "../ai/types";

/**
 * Generates a unique key for product deduplication based on title, description, and price components
 */
function generateProductKey(product: Product): string {
  const priceKey = `${product.priceValue?.toString() ?? ""}|${product.priceLabel ?? ""}|${product.priceCurrency ?? ""}|${product.priceNegotiable?.toString() ?? ""}`;
  return `${product.title.trim().toLowerCase()}|${product.description.trim().toLowerCase()}|${priceKey}`;
}

/**
 * Eliminates duplicate products based on title, price, and description.
 * Keeps the first occurrence of each unique product.
 */
function eliminateDuplicates(products: Product[]): Product[] {
  const seen = new Set<string>();
  const uniqueProducts: Product[] = [];

  for (const product of products) {
    const key = generateProductKey(product);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueProducts.push(product);
    }
  }

  return uniqueProducts;
}

@CommandHandler(RerankAndEmitGiftReadyCommand)
export class RerankAndEmitGiftReadyHandler
  implements ICommandHandler<RerankAndEmitGiftReadyCommand, void>
{
  private readonly logger = new Logger(RerankAndEmitGiftReadyHandler.name);

  constructor(
    @Inject("GIFT_READY_EVENT") private readonly giftReadyEventBus: ClientProxy,
    @Inject("REGENERATE_IDEAS_LOOP_EVENT")
    private readonly regenerateIdeasLoopEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RerankAndEmitGiftReadyCommand): Promise<void> {
    const { eventId } = command;

    // Get environment variables with defaults
    const topBestCount = Number.parseInt(
      this.configService.get<string>("TOP_BEST_COUNT") ?? "50",
    );
    const minimalScore = Number.parseInt(
      this.configService.get<string>("MINIMAL_SCORE") ?? "7",
    );
    const maxIdeasLoop = Number.parseInt(
      this.configService.get<string>("MAX_IDEAS_LOOP") ?? "1",
    );

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

      // Separate products that are already scored from those that need scoring
      const alreadyScoredProducts = allProducts.filter(
        (p) => p.rating !== null,
      );
      const unscoredProducts = allProducts.filter((p) => p.rating === null);

      this.logger.log(
        `Found ${String(alreadyScoredProducts.length)} already scored products and ${String(unscoredProducts.length)} products to score for session ${eventId}`,
      );

      // Only score products that haven't been scored yet
      let newlyScoredProducts: ProductScore[] = [];
      if (unscoredProducts.length > 0) {
        newlyScoredProducts = await this.queryBus.execute<ProductScore[]>(
          new ScoreProductsQuery(
            unscoredProducts,
            recipientProfile,
            keywords,
            eventId,
          ),
        );
      }

      // Merge already scored products with newly scored ones
      const allScoredProducts = [
        ...alreadyScoredProducts.map((p): ProductScore => {
          if (p.rating === null) {
            throw new Error(
              `Product ${p.id} has null rating but was in alreadyScoredProducts`,
            );
          }
          return {
            id: p.id,
            score: p.rating,
            reasoning: p.reasoning ?? "",
            category: p.category ?? null,
          };
        }),
        ...newlyScoredProducts,
      ];

      const updatedProducts = await this.commandBus.execute(
        new UpdateProductRatingsCommand(
          allProducts,
          allScoredProducts,
          eventId,
        ),
      );

      const goodProducts: (Product & { rating: number })[] =
        updatedProducts.filter(
          (p): p is Product & { rating: number } =>
            p.rating !== null && p.rating >= minimalScore,
        );
      goodProducts.sort((a, b) => b.rating - a.rating);

      // Check if we need to regenerate and prepare the event
      const regenerateResult = await this.commandBus.execute(
        new CheckAndPrepareRegenerateIdeasLoopCommand(
          eventId,
          session,
          updatedProducts,
          goodProducts.length,
          topBestCount,
          minimalScore,
          maxIdeasLoop,
          chatId,
          recipientProfile,
          keywords,
        ),
      );

      if (
        regenerateResult.shouldRegenerate &&
        regenerateResult.event !== null
      ) {
        this.regenerateIdeasLoopEventBus.emit(
          RegenerateIdeasLoopEvent.name,
          regenerateResult.event,
        );

        this.logger.log(
          `Emitted RegenerateIdeasLoopEvent for session ${eventId}`,
        );
        return;
      }

      // Build profile for GiftReadyEvent
      // Always include reasoning data (recipient_profile and keywords)
      // Only include save_profile and profile_name if user chose to save
      const profile =
        recipientProfile !== null || keywords.length > 0
          ? {
              recipient_profile: recipientProfile,
              key_themes_and_keywords: keywords,
              save_profile: session.giftContext?.saveProfile ?? false,
              profile_name: session.giftContext?.profileName ?? null,
            }
          : undefined;

      this.logger.log(
        `Constructed profile for GiftReadyEvent: ${JSON.stringify(profile)}`,
      );

      // Eliminate any remaining duplicates from good products before sending event
      const uniqueGoodProducts = eliminateDuplicates(goodProducts);
      const finalDuplicatesEliminated =
        goodProducts.length - uniqueGoodProducts.length;

      if (finalDuplicatesEliminated > 0) {
        this.logger.log(
          `Eliminated ${String(finalDuplicatesEliminated)} additional duplicates from good products before sending event for session ${eventId}`,
        );
      }

      const productsToSend = uniqueGoodProducts; // send all unique products with score >= minimalScore, not just top X

      const giftReadyEvent = new GiftReadyEvent(
        productsToSend.map(
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
        `Emitted GiftReadyEvent with ${String(productsToSend.length)} ranked products (score >= ${String(minimalScore)}) for session ${eventId}`,
      );
    }
  }
}
