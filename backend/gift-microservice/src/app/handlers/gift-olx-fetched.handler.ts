import { OlxFetchedEvent } from "src/domain/events/olx-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftOlxFetchedHandler {
  private readonly logger = new Logger(GiftOlxFetchedHandler.name);

  @EventPattern(OlxFetchedEvent.name)
  async handle(event: OlxFetchedEvent) {
    this.logger.log(`Received OLX results: ${event.results.length} items`);

    // Here you can process the OLX results
    // For example, store them, aggregate with other results, etc.
    // This is where you would implement the business logic for handling OLX search results
  }
}
