import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';
import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';

@Controller()
export class ChatQuestionAskedHandler {
  private readonly logger = new Logger(ChatQuestionAskedHandler.name);
  constructor(
    @Inject('CHAT_USER_ANSWERED_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  @EventPattern(ChatQuestionAskedEvent.name)
  async handle(event: ChatQuestionAskedEvent) {
    this.logger.log(`Uzyskano odpowiedz`);

    const eventToEmit: ChatUserAnsweredEvent = {
      context: event.context,
      history: [...event.history, event.question],
      answer: 'Odpowiedz na pytanie',
    };

    this.eventBus.emit(ChatUserAnsweredEvent.name, eventToEmit);

    return Promise.resolve();
  }
}
