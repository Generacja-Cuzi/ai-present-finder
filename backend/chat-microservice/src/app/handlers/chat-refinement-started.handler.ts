import {
  ChatQuestionAskedEvent,
  ChatRefinementStartedEvent,
} from "@core/events";
import type { RecipientProfile } from "@core/types";
import { ChatSession } from "src/domain/entities/chat-session.entity";
import { Repository } from "typeorm";

import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientProxy, EventPattern } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

@Controller()
export class ChatRefinementStartedHandler {
  private readonly logger = new Logger(ChatRefinementStartedHandler.name);

  constructor(
    @Inject("CHAT_QUESTION_ASKED_EVENT")
    private readonly questionAskedEventBus: ClientProxy,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
  ) {}

  @EventPattern(ChatRefinementStartedEvent.name)
  async handle(event: ChatRefinementStartedEvent): Promise<void> {
    this.logger.log(
      `Handling refinement started for chat ${event.chatId} with ${String(event.selectedListingIds.length)} selected listings`,
    );

    // Update session to refinement phase
    const session = await this.chatSessionRepository.findOne({
      where: { chatId: event.chatId },
    });

    if (session === null) {
      throw new Error(`No session found for chat ${event.chatId}`);
    }

    // Store selected listings context and switch to refinement phase
    await this.chatSessionRepository.update(
      { chatId: event.chatId },
      {
        phase: "refinement",
        selectedListingIds: event.selectedListingIds,
        selectedListingsContext: event.selectedListings,
        refinementCount: session.refinementCount + 1,
      },
    );

    this.logger.log(
      `Session ${event.chatId} updated to refinement phase (iteration ${String(session.refinementCount + 1)})`,
    );

    if (session.occasion === null || session.occasion === undefined) {
      throw new Error(`No occasion found for chat ${event.chatId}`);
    }

    // Extract user profile from pendingProfileData
    const pendingProfileData = session.pendingProfileData as {
      recipient_profile?: RecipientProfile;
    } | null;
    const userProfile = pendingProfileData?.recipient_profile;

    if (userProfile === undefined) {
      this.logger.error(
        `No recipient profile found in pendingProfileData for chat ${event.chatId}`,
      );
      throw new Error(
        `No recipient profile found for refinement in chat ${event.chatId}`,
      );
    }

    this.logger.log(
      `Found user profile for refinement: ${JSON.stringify(userProfile)}`,
    );

    // Emit first refinement question directly
    const firstQuestion = `Świetnie! Widzę że wybrałeś ${String(event.selectedListings.length)} prezentów które Ci się podobają. Powiedz mi, co w nich najbardziej przemawia do Ciebie?`;
    const firstAnswers = {
      type: "select" as const,
      answers: [
        {
          answerFullSentence: "Ergonomia i komfort",
          answerShortForm: "Ergonomia",
        },
        {
          answerFullSentence: "Styl i design produktów",
          answerShortForm: "Styl",
        },
        {
          answerFullSentence: "Funkcjonalność i praktyczność",
          answerShortForm: "Funkcjonalność",
        },
        {
          answerFullSentence: "Cena i stosunek jakości do ceny",
          answerShortForm: "Cena",
        },
      ],
    };

    const questionEvent = new ChatQuestionAskedEvent(
      event.chatId,
      firstQuestion,
      firstAnswers,
    );

    this.questionAskedEventBus.emit(ChatQuestionAskedEvent.name, questionEvent);

    this.logger.log(
      `Emitted first refinement question for chat ${event.chatId}`,
    );
  }
}
