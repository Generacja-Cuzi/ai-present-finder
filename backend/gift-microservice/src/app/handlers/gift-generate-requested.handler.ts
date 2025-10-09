/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags */
import { EventTrackingService } from "src/app/services/event-tracking.service";
import { SessionCompletionService } from "src/app/services/session-completion.service";
import { ServiceType } from "src/domain/entities/gift-event.entity";
import { FetchAllegroEvent } from "src/domain/events/fetch-allegro.event";
import { FetchAmazonEvent } from "src/domain/events/fetch-amazon.event";
import { FetchEbayEvent } from "src/domain/events/fetch-ebay.event";
import { FetchOlxEvent } from "src/domain/events/fetch-olx.event";
import { GiftGenerateRequestedEvent } from "src/domain/events/gift-generate-requested.event";
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
    private readonly eventTrackingService: EventTrackingService,
    private readonly sessionCompletionService: SessionCompletionService,
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  async handle(event: GiftGenerateRequestedEvent) {
    this.logger.log("Handling gift generate requested event");

    // Create fetch events for keywords and recommendations
    const allQueries = [
      ...event.keywords,
      ...(event.profile?.gift_recommendations ?? []),
    ];

    // Create a session for this request
    const sessionId = uuidv4();
    const services = [
      ServiceType.OLX,
      ServiceType.ALLEGRO,
      ServiceType.AMAZON,
      ServiceType.EBAY,
    ];

    // Calculate total events that will be created
    const totalEvents = allQueries.length * services.length;

    // Create session record with timestamp
    await this.eventTrackingService.createSession(
      sessionId,
      event.chatId,
      totalEvents,
    );

    // Register session for completion tracking
    this.sessionCompletionService.registerSession(sessionId, event.chatId);

    for (const query of allQueries) {
      const requestId = `req_${Date.now().toString()}_${Math.random().toString(36).slice(2, 15)}`;

      // Create separate tracking events for each query to each service
      const trackingEvents = await this.eventTrackingService.createEventSession(
        sessionId,
        services,
      );

      // Get UUIDs for each service from tracking events
      const olxEvent = trackingEvents.find(
        (trackingEvent) => trackingEvent.serviceType === ServiceType.OLX,
      );
      const allegroEvent = trackingEvents.find(
        (trackingEvent) => trackingEvent.serviceType === ServiceType.ALLEGRO,
      );
      const amazonEvent = trackingEvents.find(
        (trackingEvent) => trackingEvent.serviceType === ServiceType.AMAZON,
      );
      const ebayEvent = trackingEvents.find(
        (trackingEvent) => trackingEvent.serviceType === ServiceType.EBAY,
      );

      // Send to all services - each query gets unique UUIDs
      if (olxEvent !== undefined) {
        const fetchOlxEvent = new FetchOlxEvent(
          query,
          5,
          0,
          requestId,
          event.chatId,
          olxEvent.eventUuid,
        );
        this.olxEventBus.emit(FetchOlxEvent.name, fetchOlxEvent);
      }

      if (allegroEvent !== undefined) {
        const fetchAllegroEvent = new FetchAllegroEvent(
          query,
          5,
          0,
          requestId,
          event.chatId,
          allegroEvent.eventUuid,
        );
        this.allegroEventBus.emit(FetchAllegroEvent.name, fetchAllegroEvent);
      }

      if (amazonEvent !== undefined) {
        const fetchAmazonEvent = new FetchAmazonEvent(
          query,
          5,
          0,
          "PL",
          1,
          requestId,
          event.chatId,
          amazonEvent.eventUuid,
        );
        this.amazonEventBus.emit(FetchAmazonEvent.name, fetchAmazonEvent);
      }

      if (ebayEvent !== undefined) {
        const fetchEbayEvent = new FetchEbayEvent(
          query,
          5,
          0,
          requestId,
          event.chatId,
          ebayEvent.eventUuid,
        );
        this.ebayEventBus.emit(FetchEbayEvent.name, fetchEbayEvent);
      }
    }

    this.logger.log(
      `Sent fetch events for ${allQueries.length.toString()} queries to ${services.length.toString()} services`,
    );

    // Note: ProductFetchedEvent responses will be handled by a separate handler
  }
}
