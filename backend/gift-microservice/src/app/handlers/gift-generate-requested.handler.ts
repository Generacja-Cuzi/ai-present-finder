import { Controller, Inject, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { GiftGenerateRequestedEvent } from 'src/domain/events/gift-generate-requested.event';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';
import { FetchOlxQuery } from 'src/domain/queries/fetch-olx.query';

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);
  constructor(
    @Inject('GIFT_READY_EVENT') private readonly eventBus: ClientProxy,
    private readonly queryBus: QueryBus
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  async handle(event: GiftGenerateRequestedEvent) {
    this.logger.log('Handling gift generate requested event');

    const giftIdeas = await this.queryBus.execute(new FetchOlxQuery("" + event.keywords.join(" "), 5, 0));

    this.logger.log(`Generated gift ideas: ${JSON.stringify(giftIdeas)}`);

    const giftReadyEvent = new GiftReadyEvent(giftIdeas, event.chatId);
    this.eventBus.emit(GiftReadyEvent.name, giftReadyEvent);

    return Promise.resolve();
  }
}
