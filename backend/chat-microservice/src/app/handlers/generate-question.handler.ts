import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GenerateQuestionCommand } from 'src/domain/commands/generate-question.command';
import { ChatQuestionAskedEvent } from 'src/domain/events/chat-question-asked.event';
import { giftInterviewFlow } from '../ai/flow';
import { ChatInterviewCompletedEvent } from 'src/domain/events/chat-interview-completed.event';
import { ChatInappropriateRequestEvent } from 'src/domain/events/chat-innapropriate-request.event';

@CommandHandler(GenerateQuestionCommand)
export class GenerateQuestionHandler
  implements ICommandHandler<GenerateQuestionCommand>
{
  constructor(
    @Inject('CHAT_QUESTION_ASKED_EVENT')
    private readonly eventBus: ClientProxy,
    @Inject('CHAT_INTERVIEW_COMPLETED_EVENT')
    private readonly chatInterviewCompletedEventEventBus: ClientProxy,
    @Inject('CHAT_INNAPPROPRIATE_REQUEST_EVENT')
    private readonly inappropriateRequestEventBus: ClientProxy,
  ) {}

  async execute(command: GenerateQuestionCommand) {
    const { context, history } = command;
    let shouldStop = false;

    const result = await giftInterviewFlow({
      messages: history.map((msg) => ({
        ...msg,
        role: msg.sender,
      })),
      closeInterview: (output) => {
        const event = new ChatInterviewCompletedEvent(context, output);
        this.chatInterviewCompletedEventEventBus.emit(
          ChatInterviewCompletedEvent.name,
          event,
        );
        shouldStop = true;
      },
      flagInappropriateRequest: (reason) => {
        this.inappropriateRequestEventBus.emit(
          ChatInappropriateRequestEvent.name,
          new ChatInappropriateRequestEvent(reason, context.chatId),
        );
        shouldStop = true;
      },
    });
    if (shouldStop) {
      return;
    }
    const event = new ChatQuestionAskedEvent(context, result.text);

    this.eventBus.emit(ChatQuestionAskedEvent.name, event);
  }
}
