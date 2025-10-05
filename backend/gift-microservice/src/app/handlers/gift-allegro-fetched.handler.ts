import { AllegroFetchedEvent } from "src/domain/events/allegro-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftAllegroFetchedHandler {
  private readonly logger = new Logger(GiftAllegroFetchedHandler.name);

  @EventPattern(AllegroFetchedEvent.name)
  async handle(event: AllegroFetchedEvent) {
    this.logger.log(`Received Allegro results: ${event.results.length} items`);

    // Here you can process the Allegro results
    // For example, store them, aggregate with other results, etc.
    // This is where you would implement the business logic for handling Allegro search results
  }
}
