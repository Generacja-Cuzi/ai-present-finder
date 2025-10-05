import { EbayFetchedEvent } from "src/domain/events/ebay-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftEbayFetchedHandler {
  private readonly logger = new Logger(GiftEbayFetchedHandler.name);

  @EventPattern(EbayFetchedEvent.name)
  async handle(event: EbayFetchedEvent) {
    this.logger.log(`Received eBay results: ${event.results.length} items`);

    // Here you can process the eBay results
    // For example, store them, aggregate with other results, etc.
    // This is where you would implement the business logic for handling eBay search results
  }
}
