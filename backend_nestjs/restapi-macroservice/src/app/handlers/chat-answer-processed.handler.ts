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
import { ChatAnswerProcessedEvent } from 'src/domain/events/chat-answer-processed.event';

@Controller()
export class ChatAnswerProcessedHandler {
  private readonly logger = new Logger(ChatAnswerProcessedHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatAnswerProcessedEvent.name)
  async handle(event: ChatAnswerProcessedEvent) {
    this.logger.log(`Uzyskano keywords`);

    this.commandBus.execute(
      new EvaluateContextCommand(event.context, event.history),
    );

    return event;
  }
}
