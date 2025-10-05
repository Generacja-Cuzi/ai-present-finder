import { AmazonFetchedEvent } from "src/domain/events/amazon-fetched.event";
import { FetchAmazonRequestedEvent } from "src/domain/events/fetch-amazon-requested.event";
import { ListingDto } from "src/domain/models/listing.dto";
import { FetchAmazonQuery } from "src/domain/queries/fetch-amazon.query";

import { Controller, Inject, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class FetchAmazonRequestedHandler {
  private readonly logger = new Logger(FetchAmazonRequestedHandler.name);

  constructor(
    @Inject("AMAZON_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(FetchAmazonRequestedEvent.name)
  async handle(event: FetchAmazonRequestedEvent) {
    this.logger.log(`Handling Amazon search request: ${event.query}`);

    try {
      const results: ListingDto[] = await this.queryBus.execute(
        new FetchAmazonQuery(
          event.query,
          event.limit,
          event.offset,
          event.country,
          event.page,
        ),
      );

      const fetchedEvent = new AmazonFetchedEvent(results);
      this.eventBus.emit(AmazonFetchedEvent.name, fetchedEvent);

      this.logger.log(`Amazon search completed: ${results.length} results`);
    } catch (error) {
      this.logger.error(`Amazon search failed:`, error);
      // Send empty results on error
      const fetchedEvent = new AmazonFetchedEvent([]);
      this.eventBus.emit(AmazonFetchedEvent.name, fetchedEvent);
    }
  }
}
