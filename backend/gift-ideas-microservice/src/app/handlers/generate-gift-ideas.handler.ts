import {
  FetchAllegroEvent,
  FetchAmazonEvent,
  FetchEbayEvent,
  FetchOlxEvent,
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
  ) {}

  async execute(command: GenerateGiftIdeasCommand) {
    const { userProfile, keywords, chatId } = command;

    try {
      const giftIdeasOutput = await giftIdeasFlow({
        userProfile,
        keywords,
      });

      this.logger.log(
        `Generated ${giftIdeasOutput.gift_ideas.length.toString()} gift ideas and ${giftIdeasOutput.search_queries.length.toString()} search queries`,
      );

      // * Amazon is disabled for now cause Dodi got banned there
      const disabledServices = new Set(["amazon"]);
      const filteredSearchQueries = giftIdeasOutput.search_queries.filter(
        ({ service }) => !disabledServices.has(service),
      );

      // Send fetch events to specific shops based on AI decision
      const eventId = ulid();
      const totalEvents = filteredSearchQueries.length;

      for (const { query, service } of filteredSearchQueries) {
        switch (service) {
          case "olx": {
            const fetchOlxEvent = new FetchOlxEvent(
              query,
              5,
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
              5,
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
              5,
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
              5,
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
