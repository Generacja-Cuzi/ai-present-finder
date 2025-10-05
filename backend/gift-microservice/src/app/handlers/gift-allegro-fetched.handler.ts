import { AllegroFetchedEvent } from "src/domain/events/allegro-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftAllegroFetchedHandler {
  private readonly logger = new Logger(GiftAllegroFetchedHandler.name);

  @EventPattern(AllegroFetchedEvent.name)
  handle(event: AllegroFetchedEvent) {
    this.logger.log(
      `Received Allegro results: ${String(event.results.length)} items`,
    );
  }
}
