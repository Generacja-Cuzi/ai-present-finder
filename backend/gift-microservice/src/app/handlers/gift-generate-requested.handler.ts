import { FetchAllegroRequestedEvent } from "src/domain/events/fetch-allegro-requested.event";
import { FetchAmazonRequestedEvent } from "src/domain/events/fetch-amazon-requested.event";
import { FetchEbayRequestedEvent } from "src/domain/events/fetch-ebay-requested.event";
import { FetchOlxRequestedEvent } from "src/domain/events/fetch-olx-requested.event";
import { GiftGenerateRequestedEvent } from "src/domain/events/gift-generate-requested.event";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);
  constructor(
    @Inject("FETCH_OLX_REQUESTED") private readonly olxEventBus: ClientProxy,
    @Inject("FETCH_ALLEGRO_REQUESTED")
    private readonly allegroEventBus: ClientProxy,
    @Inject("FETCH_AMAZON_REQUESTED")
    private readonly amazonEventBus: ClientProxy,
    @Inject("FETCH_EBAY_REQUESTED") private readonly ebayEventBus: ClientProxy,
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  handle(event: GiftGenerateRequestedEvent) {
    this.logger.log("Handling gift generate requested event");

    // Generate events for each platform
    const keywords = [
      ...event.keywords,
      ...(event.profile?.gift_recommendations ?? []),
    ];

    // Send events to each microservice
    for (const keyword of keywords) {
      // OLX
      const olxEvent = new FetchOlxRequestedEvent(keyword, 5, 0);
      this.olxEventBus.emit(FetchOlxRequestedEvent.name, olxEvent);

      // Allegro
      const allegroEvent = new FetchAllegroRequestedEvent(keyword, 5, 0);
      this.allegroEventBus.emit(FetchAllegroRequestedEvent.name, allegroEvent);

      // Amazon
      const amazonEvent = new FetchAmazonRequestedEvent(keyword, 5, 0, "PL", 1);
      this.amazonEventBus.emit(FetchAmazonRequestedEvent.name, amazonEvent);

      // eBay
      const ebayEvent = new FetchEbayRequestedEvent(keyword, 5, 0);
      this.ebayEventBus.emit(FetchEbayRequestedEvent.name, ebayEvent);
    }

    this.logger.log(
      `Sent search requests for ${String(keywords.length)} keywords to all platforms`,
    );
  }
}
