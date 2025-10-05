import { AmazonFetchedEvent } from "src/domain/events/amazon-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftAmazonFetchedHandler {
  private readonly logger = new Logger(GiftAmazonFetchedHandler.name);

  @EventPattern(AmazonFetchedEvent.name)
  async handle(event: AmazonFetchedEvent) {
    this.logger.log(`Received Amazon results: ${event.results.length} items`);

    // Here you can process the Amazon results
    // For example, store them, aggregate with other results, etc.
    // This is where you would implement the business logic for handling Amazon search results
  }
}
