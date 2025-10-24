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
import type { EndConversationOutput, PotencialAnswers } from "../ai/types";

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
      birthday: "urodzin",
      anniversary: "rocznicy",
      holiday: "święta",
      "just-because": "bez okazji",
    };

    return occasionMap[occasion] || occasion;
  }

  async execute(command: GenerateQuestionCommand) {
    const { chatId, occasion, history } = command;

    // Mock the first question if no history exists
    if (history.length === 0) {
      this.logger.log(
        `Mocking the first question for chat ${chatId} with occasion ${occasion}`,
      );
      const occasionLabel = this.getOccasionLabel(occasion);
      const mockQuestion = `Dla kogo szukasz prezentu z okazji ${occasionLabel}?`;
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
      onQuestionAsked: (
        question: string,
        potentialAnswers: PotencialAnswers,
      ) => {
        const event = new ChatQuestionAskedEvent(
          chatId,
          question,
          potentialAnswers,
        );
        this.eventBus.emit(ChatQuestionAskedEvent.name, event);
      },
      onInterviewCompleted: (output: EndConversationOutput) => {
        const interviewEvent = new ChatInterviewCompletedEvent(chatId, output);
        this.chatInterviewCompletedEventEventBus.emit(
          ChatInterviewCompletedEvent.name,
          interviewEvent,
        );
        const notifyEvent = new ChatCompletedNotifyUserEvent(chatId);
        this.chatCompletedNotifyUserEventBus.emit(
          ChatCompletedNotifyUserEvent.name,
          notifyEvent,
        );
      },
      onInappropriateRequest: (reason: string) => {
        const inappropriateEvent = new ChatInappropriateRequestEvent(
          reason,
          chatId,
        );
        this.inappropriateRequestEventBus.emit(
          ChatInappropriateRequestEvent.name,
          inappropriateEvent,
        );
      },
    });
  }
}
