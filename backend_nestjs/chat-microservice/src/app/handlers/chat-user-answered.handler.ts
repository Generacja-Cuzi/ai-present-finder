import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';
import { ChatQuestionAskedCommand } from 'src/domain/commands/chat-question-asked.command';
import { ChatQuestionAskedDto } from 'src/domain/models/chat-question-asked.dto';
import { ChatUserAnsweredEvent } from 'src/domain/events/chat-user-answered.event';
import { ChatAnswerProcessedEvent } from 'src/domain/events/chat-answer-processed.event';

@Controller()
export class ChatUserAnsweredHandler {
  private readonly logger = new Logger(ChatUserAnsweredHandler.name);
  constructor(
    @Inject('CHAT_ANSWER_PROCESSED_EVENT')
    private readonly eventBus: ClientProxy,
  ) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent) {
    const keywords = ['simon', 'the', 'shark'];

    const { context, history, answer } = event;

    const answerProcessed: ChatAnswerProcessedEvent =
      new ChatAnswerProcessedEvent(
        { keywords: [...context.keywords, ...keywords] },
        history,
      );

    this.eventBus.emit(ChatAnswerProcessedEvent.name, answerProcessed);

    return event;
  }
}
