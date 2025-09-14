import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';

import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';
import { ChatAnswerProcessedEvent } from 'src/domain/events/chat-answer-processed.event';

@Controller()
export class ChatUserAnsweredHandler {
  constructor(
    @Inject('CHAT_ANSWER_PROCESSED_EVENT')
    private readonly eventBus: ClientProxy,
  ) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent) {
    const keywords = ['simon', 'the', 'shark'];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { context, history, answer: _answer } = event;

    const answerProcessed: ChatAnswerProcessedEvent =
      new ChatAnswerProcessedEvent(
        {
          keywords: [...context.keywords, ...keywords],
          chatId: context.chatId,
        },
        history,
      );

    this.eventBus.emit(ChatAnswerProcessedEvent.name, answerProcessed);

    return Promise.resolve();
  }
}
