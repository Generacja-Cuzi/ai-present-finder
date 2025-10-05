import { FetchOlxRequestedEvent } from "src/domain/events/fetch-olx-requested.event";
import { OlxFetchedEvent } from "src/domain/events/olx-fetched.event";
import { ListingDto } from "src/domain/models/listing.dto";
import { FetchOlxQuery } from "src/domain/queries/fetch-olx.query";

import { Controller, Inject, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class FetchOlxRequestedHandler {
  private readonly logger = new Logger(FetchOlxRequestedHandler.name);

  constructor(
    @Inject("OLX_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(FetchOlxRequestedEvent.name)
  async handle(event: FetchOlxRequestedEvent) {
    this.logger.log(`Handling OLX search request: ${event.query}`);

    try {
      const results: ListingDto[] = await this.queryBus.execute(
        new FetchOlxQuery(event.query, event.limit, event.offset),
      );

      const fetchedEvent = new OlxFetchedEvent(results);
      this.eventBus.emit(OlxFetchedEvent.name, fetchedEvent);

      this.logger.log(
        `OLX search completed: ${String(results.length)} results`,
      );
    } catch (error) {
      this.logger.error(`OLX search failed:`, error);
      // Send empty results on error
      const fetchedEvent = new OlxFetchedEvent([]);
      this.eventBus.emit(OlxFetchedEvent.name, fetchedEvent);
    }
  }
}
