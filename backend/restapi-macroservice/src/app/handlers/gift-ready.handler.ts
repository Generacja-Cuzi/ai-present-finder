import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { GiftReadyEvent } from 'src/domain/events/gift-ready.event';

@Controller()
export class GiftReadyHandler {
  private readonly logger = new Logger(GiftReadyHandler.name);
  constructor() {}

  @EventPattern(GiftReadyEvent.name)
  async handle(event: GiftReadyEvent) {
    this.logger.log(`Uzyskano gotowe pomysly na prezenty`);

    const giftIdeas = event.giftIdeas;

    this.logger.log(`Pomysly na prezenty: ${giftIdeas.join('; ')}`);

    return Promise.resolve();
  }
}
