import { EbayFetchedEvent } from "src/domain/events/ebay-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftEbayFetchedHandler {
  private readonly logger = new Logger(GiftEbayFetchedHandler.name);

  @EventPattern(EbayFetchedEvent.name)
  handle(event: EbayFetchedEvent) {
    this.logger.log(
      `Received eBay results: ${String(event.results.length)} items`,
    );
  }
}
