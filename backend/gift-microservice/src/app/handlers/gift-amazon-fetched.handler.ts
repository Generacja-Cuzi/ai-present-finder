import { AmazonFetchedEvent } from "src/domain/events/amazon-fetched.event";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftAmazonFetchedHandler {
  private readonly logger = new Logger(GiftAmazonFetchedHandler.name);

  @EventPattern(AmazonFetchedEvent.name)
  handle(event: AmazonFetchedEvent) {
    this.logger.log(
      `Received Amazon results: ${String(event.results.length)} items`,
    );
  }
}
