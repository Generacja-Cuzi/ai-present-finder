import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { ChatInappropriateRequestEvent } from "src/domain/events/chat-innapropriate-request.event";
import { ChatInterviewCompletedEvent } from "src/domain/events/chat-interview-completed.event";
import { ChatQuestionAskedEvent } from "src/domain/events/chat-question-asked.event";

import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { giftInterviewFlow } from "../ai/flow";

@CommandHandler(GenerateQuestionCommand)
export class GenerateQuestionHandler
  implements ICommandHandler<GenerateQuestionCommand>
{
  constructor(
    @Inject("CHAT_QUESTION_ASKED_EVENT")
    private readonly eventBus: ClientProxy,
    @Inject("CHAT_INTERVIEW_COMPLETED_EVENT")
    private readonly chatInterviewCompletedEventEventBus: ClientProxy,
    @Inject("CHAT_INNAPPROPRIATE_REQUEST_EVENT")
    private readonly inappropriateRequestEventBus: ClientProxy,
  ) {}

  async execute(command: GenerateQuestionCommand) {
    const { context, history } = command;
    let shouldStop = false as boolean;

    const result = await giftInterviewFlow({
      messages: history.map((message) => ({
        ...message,
        role: message.sender,
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
