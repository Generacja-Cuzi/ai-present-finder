import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ChatAskQuestionEvent } from 'src/domain/events/chat-ask-question.event';
import { ChatQuestionAskedCommand } from 'src/domain/commands/chat-question-asked.command';
import { ChatQuestionAskedDto } from 'src/domain/models/chat-question-asked.dto';

@Controller()
export class ChatAskQuestionHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatAskQuestionEvent.name)
  async handle(event: ChatAskQuestionEvent) {
    const question = 'Test question';

    const questionAskedDto: ChatQuestionAskedDto = {
      context: event.context,
      history: event.history,
      question,
    };

    await this.commandBus.execute(
      new ChatQuestionAskedCommand(questionAskedDto),
    );

    return event;
  }
}
