import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { GiftGenerateRequestedEvent } from 'src/domain/events/gift-generate-requested.event';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';

@Controller()
export class GiftGenerateRequestedHandler {
  private readonly logger = new Logger(GiftGenerateRequestedHandler.name);
  constructor(
    @Inject('GIFT_READY_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  @EventPattern(GiftGenerateRequestedEvent.name)
  async handle(event: GiftGenerateRequestedEvent) {
    this.logger.log('Handling gift generate requested event');

    const giftIdeas = [
      `Gift idea 1 for keywords: ${event.keywords.join(', ')}`,
      `Gift idea 2 for keywords: ${event.keywords.join(', ')}`,
      `Gift idea 3 for keywords: ${event.keywords.join(', ')}`,
    ];

    this.logger.log(`Generated gift ideas: ${giftIdeas.join('; ')}`);

    const giftReadyEvent = new GiftReadyEvent(giftIdeas);
    this.eventBus.emit(GiftReadyEvent.name, giftReadyEvent);
  }
}
