import {
  FetchAllegroEvent,
  FetchAmazonEvent,
  FetchEbayEvent,
  FetchOlxEvent,
  GiftContextInitializedEvent,
} from "@core/events";
import { ulid } from "ulid";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { GenerateGiftIdeasCommand } from "../../domain/commands/generate-gift-ideas.command";
import { giftIdeasFlow } from "../ai/flow";

@CommandHandler(GenerateGiftIdeasCommand)
export class GenerateGiftIdeasHandler
  implements ICommandHandler<GenerateGiftIdeasCommand>
{
  private readonly logger = new Logger(GenerateGiftIdeasHandler.name);

  constructor(
    @Inject("FETCH_OLX_EVENT") private readonly olxEventBus: ClientProxy,
    @Inject("FETCH_ALLEGRO_EVENT")
    private readonly allegroEventBus: ClientProxy,
    @Inject("FETCH_AMAZON_EVENT") private readonly amazonEventBus: ClientProxy,
    @Inject("FETCH_EBAY_EVENT") private readonly ebayEventBus: ClientProxy,
    @Inject("GIFT_CONTEXT_INITIALIZED_EVENT")
    private readonly rerankingEventBus: ClientProxy,
  ) {}

  async execute(command: GenerateGiftIdeasCommand): Promise<void> {
    const { userProfile, keywords, keyThemes, chatId } = command;

    try {
      const giftIdeasOutput = await giftIdeasFlow({
        userProfile,
        keywords,
        keyThemes,
      });

      this.logger.log(
        `Generated ${giftIdeasOutput.gift_ideas.length.toString()} gift ideas and ${giftIdeasOutput.search_queries.length.toString()} search queries (6 per service: allegro, olx, ebay, amazon)`,
      );

      // * Amazon is disabled for now cause Dodi got banned there
      const disabledServices = new Set(["amazonxxx"]);
      const filteredSearchQueries = giftIdeasOutput.search_queries.filter(
        ({ service }) => !disabledServices.has(service),
      );

      // Send fetch events to specific shops based on AI decision
      const eventId = ulid();
      const totalEvents = filteredSearchQueries.length;

      // Send gift context to reranking service
      this.rerankingEventBus.emit(
        GiftContextInitializedEvent.name,
        new GiftContextInitializedEvent(
          userProfile,
          keywords,
          chatId,
          eventId,
          totalEvents,
        ),
      );

      for (const { query, service } of filteredSearchQueries) {
        switch (service) {
          case "olx": {
            const fetchOlxEvent = new FetchOlxEvent(
              query,
              20,
              0,
              chatId,
              eventId,
              totalEvents,
            );
            this.olxEventBus.emit(FetchOlxEvent.name, fetchOlxEvent);
            break;
          }
          case "allegro": {
            const fetchAllegroEvent = new FetchAllegroEvent(
              query,
              20,
              0,
              chatId,
              eventId,
              totalEvents,
            );
            this.allegroEventBus.emit(
              FetchAllegroEvent.name,
              fetchAllegroEvent,
            );
            break;
          }
          case "amazon": {
            const fetchAmazonEvent = new FetchAmazonEvent(
              query,
              20,
              0,
              "PL",
              1,
              chatId,
              eventId,
              totalEvents,
            );
            this.amazonEventBus.emit(FetchAmazonEvent.name, fetchAmazonEvent);
            break;
          }
          case "ebay": {
            const fetchEbayEvent = new FetchEbayEvent(
              query,
              20,
              0,
              chatId,
              eventId,
              totalEvents,
            );
            this.ebayEventBus.emit(FetchEbayEvent.name, fetchEbayEvent);
            break;
          }
          default: {
            const _exhaustiveCheck: never = service;
            break;
          }
        }
      }

      this.logger.log(
        `Sent ${totalEvents.toString()} fetch events to targeted services`,
      );
    } catch (error) {
      this.logger.error("Error generating gift ideas:", error);
    }
  }
}
