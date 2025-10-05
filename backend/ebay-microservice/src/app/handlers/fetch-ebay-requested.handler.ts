import { EbayFetchedEvent } from "src/domain/events/ebay-fetched.event";
import { FetchEbayRequestedEvent } from "src/domain/events/fetch-ebay-requested.event";
import { ListingDto } from "src/domain/models/listing.dto";
import { FetchEbayQuery } from "src/domain/queries/fetch-ebay.query";

import { Controller, Inject, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class FetchEbayRequestedHandler {
  private readonly logger = new Logger(FetchEbayRequestedHandler.name);

  constructor(
    @Inject("EBAY_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(FetchEbayRequestedEvent.name)
  async handle(event: FetchEbayRequestedEvent) {
    this.logger.log(`Handling eBay search request: ${event.query}`);

    try {
      const results: ListingDto[] = await this.queryBus.execute(
        new FetchEbayQuery(event.query, event.limit, event.offset),
      );

      const fetchedEvent = new EbayFetchedEvent(results);
      this.eventBus.emit(EbayFetchedEvent.name, fetchedEvent);

      this.logger.log(`eBay search completed: ${results.length} results`);
    } catch (error) {
      this.logger.error(`eBay search failed:`, error);
      // Send empty results on error
      const fetchedEvent = new EbayFetchedEvent([]);
      this.eventBus.emit(EbayFetchedEvent.name, fetchedEvent);
    }
  }
}
