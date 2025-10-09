/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags */
import {
  FetchAllegroEvent,
  FetchEbayEvent,
  FetchOlxEvent,
  GiftGenerateRequestedEvent,
} from "@core/events";
import { v4 as uuidv4 } from "uuid";

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

    const eventUuid = uuidv4();
    const numberOfServices = 3;
    const totalEvents = allQueries.length * numberOfServices; //! 3 services per query

    for (const query of allQueries) {
      const requestId = `req_${Date.now().toString()}_${Math.random().toString(36).slice(2, 15)}`;

      // Emit fetch events for all services with totalEvents
      const fetchOlxEvent = new FetchOlxEvent(
        query,
        5,
        0,
        requestId,
        event.chatId,
        eventUuid,
        totalEvents,
      );
      this.olxEventBus.emit(FetchOlxEvent.name, fetchOlxEvent);

      const fetchAllegroEvent = new FetchAllegroEvent(
        query,
        5,
        0,
        requestId,
        event.chatId,
        eventUuid,
        totalEvents,
      );
      this.allegroEventBus.emit(FetchAllegroEvent.name, fetchAllegroEvent);

      // const fetchAmazonEvent = new FetchAmazonEvent(
      //   query,
      //   5,
      //   0,
      //   "PL",
      //   1,
      //   requestId,
      //   event.chatId,
      //   eventUuid,
      //   totalEvents,
      // );
      // this.amazonEventBus.emit(FetchAmazonEvent.name, fetchAmazonEvent);

      const fetchEbayEvent = new FetchEbayEvent(
        query,
        5,
        0,
        requestId,
        event.chatId,
        eventUuid,
        totalEvents,
      );
      this.ebayEventBus.emit(FetchEbayEvent.name, fetchEbayEvent);
    }

    this.logger.log(
      `Sent fetch events for ${allQueries.length.toString()} queries to ${numberOfServices.toString()} services`,
    );
  }
}
