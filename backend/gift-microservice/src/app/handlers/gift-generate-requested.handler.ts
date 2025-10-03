import { GiftGenerateRequestedEvent } from "src/domain/events/gift-generate-requested.event";
import { GiftReadyEvent } from "src/domain/events/gift-ready.event";
import { FetchOlxQuery } from "src/domain/queries/fetch-olx.query";

import { Controller, Inject, Logger } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);
  constructor(
    @Inject("GIFT_READY_EVENT") private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  async handle(event: GiftGenerateRequestedEvent) {
    this.logger.log("Handling gift generate requested event");

    const queries = [
      ...event.keywords.map((keyword) => new FetchOlxQuery(keyword, 5, 0)),
      ...(event.profile?.gift_recommendations.map(
        (recommendation) => new FetchOlxQuery(recommendation, 5, 0),
      ) ?? []),
    ];

    const giftIdeas = await Promise.all(
      queries.map(async (query) => this.queryBus.execute(query)),
    );

    this.logger.log(`Generated gift ideas: ${JSON.stringify(giftIdeas)}`);

    const giftReadyEvent = new GiftReadyEvent(giftIdeas.flat(), event.chatId);
    this.eventBus.emit(GiftReadyEvent.name, giftReadyEvent);
  }
}
