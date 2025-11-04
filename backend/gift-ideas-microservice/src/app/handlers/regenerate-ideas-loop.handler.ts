import {
  GiftContextInitializedEvent,
  RegenerateIdeasLoopEvent,
} from "@core/events";

import { Controller, Inject, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

import { EmitFetchEventsCommand } from "../../domain/commands/emit-fetch-events.command";
import { giftIdeasFlow } from "../ai/flow";
import { filterDisabledServices } from "../utils/search-query.utils";

@Controller()
export class RegenerateIdeasLoopHandler {
  private readonly logger = new Logger(RegenerateIdeasLoopHandler.name);

  constructor(
    @Inject("GIFT_CONTEXT_INITIALIZED_EVENT")
    private readonly rerankingEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  @EventPattern(RegenerateIdeasLoopEvent.name)
  async handle(event: RegenerateIdeasLoopEvent): Promise<void> {
    this.logger.log(
      `Handling RegenerateIdeasLoopEvent for chat ${event.chatId}, eventId ${event.eventId}`,
    );

    const performanceStartTime = performance.now();

    // Extract key themes from keywords (assuming they're in keywords)
    const keyThemes = event.keywords;

    // Use the flow with optional feedback
    const giftIdeasOutput = await giftIdeasFlow({
      userProfile: event.userProfile,
      keywords: event.keywords,
      keyThemes,
      badProducts: event.badProducts,
      providerCounts: event.providerCounts,
    });

    const performanceEndTime = performance.now();
    const performanceDuration = performanceEndTime - performanceStartTime;
    this.logger.log(
      `AI flow with feedback took ${performanceDuration.toFixed(2)}ms for session ${event.eventId}`,
    );

    this.logger.log(
      `Regenerated ${giftIdeasOutput.gift_ideas.length.toString()} gift ideas and ${giftIdeasOutput.search_queries.length.toString()} search queries with feedback from ${String(event.badProducts.length)} bad products`,
    );

    // Use the same eventId for continuation
    const eventId = event.eventId;

    // Combine keywords
    const combinedKeywords = [...event.keywords];

    // Calculate totalEvents after filtering disabled services
    const filteredSearchQueries = filterDisabledServices(
      giftIdeasOutput.search_queries,
    );
    const totalEvents = filteredSearchQueries.length;

    this.logger.log(
      `Sending GiftContextInitializedEvent with keywords: ${JSON.stringify(combinedKeywords)} (regeneration loop)`,
    );

    this.rerankingEventBus.emit(
      GiftContextInitializedEvent.name,
      new GiftContextInitializedEvent(
        event.userProfile,
        combinedKeywords,
        event.chatId,
        eventId,
        totalEvents,
        event.saveProfile,
        event.profileName,
      ),
    );

    await this.commandBus.execute(
      new EmitFetchEventsCommand(
        giftIdeasOutput.search_queries,
        event.chatId,
        eventId,
        giftIdeasOutput.search_queries.length,
      ),
    );
  }
}
