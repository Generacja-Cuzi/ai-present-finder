import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GenerateQuestionCommand } from 'src/domain/commands/generate-question.command';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';

@CommandHandler(GenerateQuestionCommand)
export class GenerateQuestionHandler
  implements ICommandHandler<GenerateQuestionCommand>
{
  constructor(
    @Inject('CHAT_QUESTION_ASKED_EVENT')
    private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: GenerateQuestionCommand) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { context, history: _history } = command;

    const question = 'Test question. What is your name?';

    const event = new ChatQuestionAskedEvent(context, question);

    this.eventBus.emit(ChatQuestionAskedEvent.name, event);

    return Promise.resolve();
  }
}
