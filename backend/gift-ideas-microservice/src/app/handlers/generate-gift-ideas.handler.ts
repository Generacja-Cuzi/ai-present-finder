import { GiftContextInitializedEvent } from "@core/events";
import { ulid } from "ulid";

import { Inject, Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { EmitFetchEventsCommand } from "../../domain/commands/emit-fetch-events.command";
import { GenerateGiftIdeasCommand } from "../../domain/commands/generate-gift-ideas.command";
import { giftIdeasFlow } from "../ai/flow";
import { filterDisabledServices } from "../utils/search-query.utils";

@CommandHandler(GenerateGiftIdeasCommand)
export class GenerateGiftIdeasHandler
  implements ICommandHandler<GenerateGiftIdeasCommand>
{
  private readonly logger = new Logger(GenerateGiftIdeasHandler.name);

  constructor(
    @Inject("GIFT_CONTEXT_INITIALIZED_EVENT")
    private readonly rerankingEventBus: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: GenerateGiftIdeasCommand): Promise<void> {
    const {
      userProfile,
      keywords,
      keyThemes,
      chatId,
      minPrice,
      maxPrice,
      saveProfile,
      profileName,
    } = command;

    this.logger.log(
      `GenerateGiftIdeasCommand received: chatId=${chatId}, saveProfile=${String(saveProfile)}, profileName=${String(profileName)}, keywords=${JSON.stringify(keywords)}, keyThemes=${JSON.stringify(keyThemes)}, minPrice=${String(minPrice)}, maxPrice=${String(maxPrice)}`,
    );

    try {
      const performanceStartTime = performance.now();
      const giftIdeasOutput = await giftIdeasFlow({
        userProfile,
        keywords,
        keyThemes,
      });
      const performanceEndTime = performance.now();
      const performanceDuration = performanceEndTime - performanceStartTime;
      this.logger.log(
        `AI flow took ${performanceDuration.toFixed(2)}ms for session ${chatId}`,
      );

      this.logger.log(
        `Generated ${giftIdeasOutput.gift_ideas.length.toString()} gift ideas and ${giftIdeasOutput.search_queries.length.toString()} search queries (6 per service: allegro, olx, ebay, amazon)`,
      );

      // Send fetch events to specific shops based on AI decision
      const eventId = ulid();

      // Combine stalking keywords and interview key themes for gift context
      const combinedKeywords = [...keywords, ...keyThemes];

      // Calculate totalEvents after filtering disabled services
      const filteredSearchQueries = filterDisabledServices(
        giftIdeasOutput.search_queries,
      );
      const totalEvents = filteredSearchQueries.length;

      this.logger.log(
        `Sending GiftContextInitializedEvent with keywords: ${JSON.stringify(combinedKeywords)}`,
      );

      this.rerankingEventBus.emit(
        GiftContextInitializedEvent.name,
        new GiftContextInitializedEvent(
          userProfile,
          combinedKeywords,
          chatId,
          eventId,
          totalEvents,
          saveProfile,
          profileName,
        ),
      );

      // Emit fetch events using the command
      await this.commandBus.execute(
        new EmitFetchEventsCommand(
          giftIdeasOutput.search_queries,
          chatId,
          eventId,
          giftIdeasOutput.search_queries.length,
          minPrice,
          maxPrice,
        ),
      );
    } catch (error) {
      this.logger.error("Error generating gift ideas:", error);
    }
  }
}
