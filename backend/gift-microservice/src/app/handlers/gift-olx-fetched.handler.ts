import { OlxFetchedEvent } from "src/domain/events/olx-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftOlxFetchedHandler {
  private readonly logger = new Logger(GiftOlxFetchedHandler.name);

  @EventPattern(OlxFetchedEvent.name)
  handle(event: OlxFetchedEvent) {
    this.logger.log(
      `Received OLX results: ${String(event.results.length)} items`,
    );
  }
}
