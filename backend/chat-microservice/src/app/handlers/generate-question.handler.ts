import {
  ChatInappropriateRequestEvent,
  ChatQuestionAskedEvent,
} from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import {
  ChatSession,
  ChatSessionPhase,
} from "src/domain/entities/chat-session.entity";
import { Repository } from "typeorm";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

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
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
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
    const { chatId, occasion, history, userProfile } = command;

    // Check if we're in refinement mode
    const session = await this.chatSessionRepository.findOne({
      where: { chatId },
    });

    if (session?.phase === "refinement" && history.length === 0) {
      // Starting refinement - generate question based on selected listings
      this.logger.log(
        `Starting refinement for chat ${chatId} with ${String(session.selectedListingIds?.length ?? 0)} selected gifts`,
      );

      const selectedGiftsContext = session.selectedListingsContext ?? [];
      const mockQuestion = `Świetnie! Widzę że wybrałeś ${String(selectedGiftsContext.length)} prezentów które Ci się podobają. Powiedz mi, co w nich najbardziej przemawia do Ciebie?`;
      const mockAnswers = {
        type: "select" as const,
        answers: [
          {
            answerFullSentence: "Cena - mieszczą się w moim budżecie",
            answerShortForm: "Cena",
          },
          {
            answerFullSentence: "Kategoria produktu jest idealna",
            answerShortForm: "Kategoria",
          },
          {
            answerFullSentence: "Styl i design produktów",
            answerShortForm: "Styl",
          },
          {
            answerFullSentence: "Funkcjonalność i zastosowanie",
            answerShortForm: "Funkcjonalność",
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

    // Mock the first question if no history exists
    if (history.length === 0) {
      this.logger.log(
        `Mocking the first question for chat ${chatId} with occasion ${occasion}`,
      );
      const occasionLabel = this.getOccasionLabel(occasion);

      // If user profile exists, skip the first question about who the gift is for
      if (userProfile !== undefined) {
        const mockQuestion = `Świetnie! Mam już podstawowe informacje o tej osobie. Powiedz mi, jak spędza ona wolny czas?`;
        const mockAnswers = {
          type: "select" as const,
          answers: [
            {
              answerFullSentence: "Czyta książki lub ogląda filmy/seriale",
              answerShortForm: "Czytanie/Oglądanie",
            },
            {
              answerFullSentence: "Uprawia sport lub aktywności fizyczne",
              answerShortForm: "Sport/Aktywność",
            },
            {
              answerFullSentence: "Spotyka się ze znajomymi lub rodziną",
              answerShortForm: "Życie towarzyskie",
            },
            {
              answerFullSentence: "Ma różne hobby i zainteresowania",
              answerShortForm: "Hobby",
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
      userProfile,
      selectedGiftsContext: session?.selectedListingsContext,
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
      onInterviewCompleted: async (output: EndConversationOutput) => {
        // Zamiast od razu wysyłać ChatInterviewCompletedEvent,
        // zapisz profil tymczasowo i zadaj pytanie o zapisanie
        this.logger.log(
          `Interview completed for chat ${chatId}, asking about profile save`,
        );

        // Zapisz dane profilu tymczasowo w sesji
        const completedSession = await this.chatSessionRepository.findOne({
          where: { chatId },
        });
        if (completedSession !== null) {
          completedSession.phase = "ask_save_profile" as ChatSessionPhase;
          completedSession.pendingProfileData = structuredClone(
            output,
          ) as Record<string, unknown>;
          await this.chatSessionRepository.save(completedSession);
        }

        // Zadaj pytanie o zapisanie profilu
        const saveProfileQuestion =
          "Czy chcesz zapisać profil tej osoby, aby w przyszłości szybciej znaleźć prezent?";
        const saveProfileAnswers = {
          type: "select" as const,
          answers: [
            {
              answerFullSentence: "Tak, chcę zapisać profil",
              answerShortForm: "Tak",
            },
            {
              answerFullSentence: "Nie, nie chcę zapisywać profilu",
              answerShortForm: "Nie",
            },
          ],
        };

        const event = new ChatQuestionAskedEvent(
          chatId,
          saveProfileQuestion,
          saveProfileAnswers,
        );
        this.eventBus.emit(ChatQuestionAskedEvent.name, event);
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
