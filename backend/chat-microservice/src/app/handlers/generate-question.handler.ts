import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
} from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";

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
    @Inject("CHAT_COMPLETED_NOTIFY_USER_EVENT")
    private readonly chatCompletedNotifyUserEventBus: ClientProxy,
  ) {}

  async execute(command: GenerateQuestionCommand) {
    const { chatId, history } = command;
    let shouldStop = false as boolean;

    const result = await giftInterviewFlow({
      messages: history.map((message) => ({
        ...message,
        role: message.sender,
      })),
      closeInterview: (output) => {
        const event = new ChatInterviewCompletedEvent(chatId, output);
        this.chatInterviewCompletedEventEventBus.emit(
          ChatInterviewCompletedEvent.name,
          event,
        );
        const notifyEvent = new ChatCompletedNotifyUserEvent(chatId);
        this.chatCompletedNotifyUserEventBus.emit(
          ChatCompletedNotifyUserEvent.name,
          notifyEvent,
        );
        shouldStop = true;
      },
      flagInappropriateRequest: (reason) => {
        this.inappropriateRequestEventBus.emit(
          ChatInappropriateRequestEvent.name,
          new ChatInappropriateRequestEvent(reason, chatId),
        );
        shouldStop = true;
      },
    });
    if (shouldStop) {
      return;
    }
    const event = new ChatQuestionAskedEvent(chatId, result.text);

    this.eventBus.emit(ChatQuestionAskedEvent.name, event);
  }
}
