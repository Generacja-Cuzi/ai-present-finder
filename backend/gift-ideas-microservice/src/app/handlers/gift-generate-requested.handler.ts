/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags */
import {
  FetchAllegroEvent,
  FetchEbayEvent,
  FetchOlxEvent,
  GiftGenerateRequestedEvent,
} from "@core/events";
import { ulid } from "ulid";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);

  constructor(
    @Inject("FETCH_OLX_EVENT") private readonly olxEventBus: ClientProxy,
    @Inject("FETCH_ALLEGRO_EVENT")
    private readonly allegroEventBus: ClientProxy,
    @Inject("FETCH_AMAZON_EVENT") private readonly amazonEventBus: ClientProxy,
    @Inject("FETCH_EBAY_EVENT") private readonly ebayEventBus: ClientProxy,
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  handle(event: GiftGenerateRequestedEvent) {
    this.logger.log("Handling gift generate requested event");

    const allQueries = [
      ...event.keywords,
      ...(event.profile?.gift_recommendations ?? []),
    ];

    const eventId = ulid();

    const fetchServices: ((query: string, totalEvents: number) => void)[] = [
      (query, totalEvents) => {
        const fetchOlxEvent = new FetchOlxEvent(
          query,
          5,
          0,
          event.chatId,
          eventId,
          totalEvents,
        );
        this.olxEventBus.emit(FetchOlxEvent.name, fetchOlxEvent);
      },
      (query, totalEvents) => {
        const fetchAllegroEvent = new FetchAllegroEvent(
          query,
          5,
          0,
          event.chatId,
          eventId,
          totalEvents,
        );
        this.allegroEventBus.emit(FetchAllegroEvent.name, fetchAllegroEvent);
      },
      (query, totalEvents) => {
        const fetchEbayEvent = new FetchEbayEvent(
          query,
          5,
          0,
          event.chatId,
          eventId,
          totalEvents,
        );
        this.ebayEventBus.emit(FetchEbayEvent.name, fetchEbayEvent);
      },
    ];

    const numberOfServices = fetchServices.length;
    const totalEvents = allQueries.length * numberOfServices;

    for (const query of allQueries) {
      for (const fetchService of fetchServices) {
        fetchService(query, totalEvents);
      }
    }
    this.logger.log(
      `Sent fetch events for ${allQueries.length.toString()} queries to ${numberOfServices.toString()} services`,
    );
  }
}
