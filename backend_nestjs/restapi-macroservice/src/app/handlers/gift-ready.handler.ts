import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';
import { ContextDto } from 'src/domain/models/context.dto';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';
import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';
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

    return event;
  }
}
