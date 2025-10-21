import {
  ChatCompletedNotifyUserEvent,
  ChatInappropriateRequestEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
} from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";

import { Inject, Logger } from "@nestjs/common";
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

  private readonly logger = new Logger(GenerateQuestionHandler.name);

  private getOccasionLabel(occasion: string): string {
    const occasionMap: Record<string, string> = {
      birthday: "urodziny",
      anniversary: "rocznicę",
      holiday: "święta",
      "just-because": "bez okazji",
    };

    return occasionMap[occasion] || occasion;
  }

  async execute(command: GenerateQuestionCommand) {
    const { chatId, occasion, history } = command;

    // Mock the first question if no history exists
    if (history.length === 0) {
      const occasionLabel = this.getOccasionLabel(occasion);
      const mockQuestion = `Dla kogo szukasz prezentu na okazję: ${occasionLabel}`;
      const mockAnswers = {
        type: "select" as const,
        answers: [
          {
            answerFullSentence: "Dla mojego partnera/partnerki",
            answerShortForm: "Partner/Partnerka",
          },
          {
            answerFullSentence:
              "Dla członka rodziny (rodzice, rodzeństwo, dziadkowie)",
            answerShortForm: "Rodzina",
          },
          {
            answerFullSentence: "Dla przyjaciela/przyjaciółki",
            answerShortForm: "Przyjaciel/Przyjaciółka",
          },
          {
            answerFullSentence: "Dla kolegi/koleżanki z pracy",
            answerShortForm: "Kolega/Koleżanka z pracy",
          },
        ],
      };

      const event = new ChatQuestionAskedEvent(
        chatId,
        mockQuestion,
        mockAnswers,
      );
      this.eventBus.emit(ChatQuestionAskedEvent.name, event);
      return;
    }

    await giftInterviewFlow({
      logger: this.logger,
      occasion: this.getOccasionLabel(occasion),
      messages: history.map((message) => ({
        ...message,
        role: message.sender,
      })),
      askAQuestionWithAnswerSuggestions: (questionn, potentialAnswerss) => {
        const event = new ChatQuestionAskedEvent(
          chatId,
          questionn,
          potentialAnswerss,
        );
        this.eventBus.emit(ChatQuestionAskedEvent.name, event);
      },
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
      },
      flagInappropriateRequest: (reason) => {
        this.inappropriateRequestEventBus.emit(
          ChatInappropriateRequestEvent.name,
          new ChatInappropriateRequestEvent(reason, chatId),
        );
      },
    });
  }
}
