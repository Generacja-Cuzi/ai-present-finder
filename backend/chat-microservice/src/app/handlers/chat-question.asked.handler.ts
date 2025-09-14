import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChatQuestionAskedCommand } from 'src/domain/commands/chat-question-asked.command';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';

@CommandHandler(ChatQuestionAskedCommand)
export class ChatQuestionAskedHandler
  implements ICommandHandler<ChatQuestionAskedCommand>
{
  constructor(
    @Inject('CHAT_QUESTION_ASKED_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: ChatQuestionAskedCommand) {
    const { chatQuestionAskedDto } = command;

    const { context, history, question } = chatQuestionAskedDto;

    const event = new ChatQuestionAskedEvent(context, history, question);

    this.eventBus.emit(ChatQuestionAskedEvent.name, event);

    return Promise.resolve();
  }
}
