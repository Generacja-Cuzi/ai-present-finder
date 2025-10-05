import { AllegroFetchedEvent } from "src/domain/events/allegro-fetched.event";
import { FetchAllegroRequestedEvent } from "src/domain/events/fetch-allegro-requested.event";
import { ListingDto } from "src/domain/models/listing.dto";
import { FetchAllegroQuery } from "src/domain/queries/fetch-allegro.query";

import { Controller, Inject, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class FetchAllegroRequestedHandler {
  private readonly logger = new Logger(FetchAllegroRequestedHandler.name);

  constructor(
    @Inject("ALLEGRO_FETCHED_EVENT") private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(FetchAllegroRequestedEvent.name)
  async handle(event: FetchAllegroRequestedEvent) {
    this.logger.log(`Handling Allegro search request: ${event.query}`);

    try {
      const results: ListingDto[] = await this.queryBus.execute(
        new FetchAllegroQuery(event.query, event.limit, event.offset),
      );

      const fetchedEvent = new AllegroFetchedEvent(results);
      this.eventBus.emit(AllegroFetchedEvent.name, fetchedEvent);

      this.logger.log(`Allegro search completed: ${results.length} results`);
    } catch (error) {
      this.logger.error(`Allegro search failed:`, error);
      const fetchedEvent = new AllegroFetchedEvent([]);
      this.eventBus.emit(AllegroFetchedEvent.name, fetchedEvent);
    }
  }
}
