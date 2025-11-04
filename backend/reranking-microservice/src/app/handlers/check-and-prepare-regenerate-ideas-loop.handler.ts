import type { BadProductInfo, ProviderCount } from "@core/events";
import { RegenerateIdeasLoopEvent } from "@core/events";
import { Repository } from "typeorm";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";

import { CheckAndPrepareRegenerateIdeasLoopCommand } from "../../domain/commands/check-and-prepare-regenerate-ideas-loop.command";
import type { RegenerateIdeasLoopResult } from "../../domain/commands/check-and-prepare-regenerate-ideas-loop.command";
import { GiftSession } from "../../domain/entities/gift-session.entity";

@CommandHandler(CheckAndPrepareRegenerateIdeasLoopCommand)
export class CheckAndPrepareRegenerateIdeasLoopHandler
  implements
    ICommandHandler<
      CheckAndPrepareRegenerateIdeasLoopCommand,
      RegenerateIdeasLoopResult
    >
{
  private readonly logger = new Logger(
    CheckAndPrepareRegenerateIdeasLoopHandler.name,
  );

  constructor(
    @InjectRepository(GiftSession)
    private readonly giftSessionRepository: Repository<GiftSession>,
  ) {}

  async execute(
    command: CheckAndPrepareRegenerateIdeasLoopCommand,
  ): Promise<RegenerateIdeasLoopResult> {
    const {
      eventId,
      session,
      updatedProducts,
      goodProductsCount,
      topBestCount,
      minimalScore,
      maxIdeasLoop,
      chatId,
      recipientProfile,
      keywords,
    } = command;

    // Check if we have enough products
    const currentLoopCount: number =
      typeof session.loopCount === "number" ? session.loopCount : 0;

    if (goodProductsCount < topBestCount && currentLoopCount < maxIdeasLoop) {
      // Increment loop count
      const newLoopCount: number = currentLoopCount + 1;
      await this.giftSessionRepository.update(
        { eventId },
        { loopCount: newLoopCount },
      );

      // Get bad products (score < minimalScore or null)
      const badProducts: BadProductInfo[] = updatedProducts
        .filter((p) => p.rating === null || p.rating < minimalScore)
        .map((p) => ({
          title: p.title,
          description: p.description,
          link: p.link,
          provider: p.provider,
          score: p.rating ?? 0,
          reasoning: p.reasoning,
        }));

      // Count products per provider
      const providerCountsMap = new Map<string, number>();
      for (const product of updatedProducts) {
        const provider = product.provider;
        const currentCount = providerCountsMap.get(provider);
        providerCountsMap.set(provider, (currentCount ?? 0) + 1);
      }
      const providerCounts: ProviderCount[] = [
        ...providerCountsMap.entries(),
      ].map(([provider, count]) => ({ provider, count }));

      this.logger.log(
        `Not enough products (${String(goodProductsCount)}/${String(topBestCount)}) with score >= ${String(minimalScore)}. Preparing RegenerateIdeasLoopEvent. Loop count: ${String(newLoopCount)}/${String(maxIdeasLoop)}`,
      );

      const regenerateEvent: RegenerateIdeasLoopEvent =
        new RegenerateIdeasLoopEvent(
          chatId,
          eventId,
          recipientProfile,
          keywords,
          badProducts,
          providerCounts,
          session.giftContext?.saveProfile,
          session.giftContext?.profileName ?? null,
        );

      this.logger.log(
        `Prepared RegenerateIdeasLoopEvent with ${String(badProducts.length)} bad products and ${String(providerCounts.length)} provider counts for session ${eventId}`,
      );

      return {
        shouldRegenerate: true,
        event: regenerateEvent,
        newLoopCount,
      };
    }

    return {
      shouldRegenerate: false,
      event: null,
      newLoopCount: currentLoopCount,
    };
  }
}
