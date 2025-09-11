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

@Controller()
export class ChatAskQuestionHandler {
  private readonly logger = new Logger(ChatAskQuestionHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatAskQuestionEvent.name)
  async handle(event: ChatAskQuestionEvent) {
    const question = 'Test question';

    const questionAskedDto: ChatQuestionAskedDto = {
      context: event.context,
      history: event.history,
      question,
    };

    this.commandBus.execute(new ChatQuestionAskedCommand(questionAskedDto));

    return event;
  }
}
