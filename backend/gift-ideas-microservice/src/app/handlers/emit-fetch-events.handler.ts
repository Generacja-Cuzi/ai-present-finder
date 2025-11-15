import {
  FetchAllegroEvent,
  FetchAmazonEvent,
  FetchEbayEvent,
  FetchOlxEvent,
} from "@core/events";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { EmitFetchEventsCommand } from "../../domain/commands/emit-fetch-events.command";
import { filterDisabledServices } from "../utils/search-query.utils";

@CommandHandler(EmitFetchEventsCommand)
export class EmitFetchEventsHandler
  implements ICommandHandler<EmitFetchEventsCommand, number>
{
  private readonly logger = new Logger(EmitFetchEventsHandler.name);

  constructor(
    @Inject("FETCH_OLX_EVENT") private readonly olxEventBus: ClientProxy,
    @Inject("FETCH_ALLEGRO_EVENT")
    private readonly allegroEventBus: ClientProxy,
    @Inject("FETCH_AMAZON_EVENT") private readonly amazonEventBus: ClientProxy,
    @Inject("FETCH_EBAY_EVENT") private readonly ebayEventBus: ClientProxy,
  ) {}

  // Event emission is synchronous (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: EmitFetchEventsCommand): Promise<number> {
    const { searchQueries, chatId, eventId, totalEvents, minPrice, maxPrice } =
      command;

    const filteredSearchQueries = filterDisabledServices(searchQueries);

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
            minPrice,
            maxPrice,
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
            minPrice,
            maxPrice,
          );
          this.allegroEventBus.emit(FetchAllegroEvent.name, fetchAllegroEvent);
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
            minPrice,
            maxPrice,
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
            minPrice,
            maxPrice,
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
      `Sent ${String(filteredSearchQueries.length)} fetch events to targeted services`,
    );

    return filteredSearchQueries.length;
  }
}
