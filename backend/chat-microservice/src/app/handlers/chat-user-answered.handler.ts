import {
  ChatCompletedNotifyUserEvent,
  ChatInterviewCompletedEvent,
  ChatQuestionAskedEvent,
  ChatUserAnsweredEvent,
} from "@core/events";
import type { EndConversationOutput } from "src/app/ai/types";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { ChatSession } from "src/domain/entities/chat-session.entity";
import { GetOccasionQuery } from "src/domain/queries/get-occasion.query";
import { Repository } from "typeorm";

import { Controller, Inject, Logger } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ClientProxy, EventPattern } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";

@Controller()
export class ChatUserAnsweredHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @Inject("CHAT_QUESTION_ASKED_EVENT")
    private readonly questionAskedEventBus: ClientProxy,
    @Inject("CHAT_INTERVIEW_COMPLETED_EVENT")
    private readonly interviewCompletedEventBus: ClientProxy,
    @Inject("CHAT_COMPLETED_NOTIFY_USER_EVENT")
    private readonly chatCompletedNotifyUserEventBus: ClientProxy,
  ) {}

  private readonly logger = new Logger(ChatUserAnsweredHandler.name);

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent): Promise<void> {
    // Sprawdź fazę sesji
    const session = await this.chatSessionRepository.findOne({
      where: { chatId: event.chatId },
    });

    if (session === null) {
      throw new Error(`No session found for chat ${event.chatId}`);
    }

    // Obsługa pytania o zapisanie profilu
    if (session.phase === "ask_save_profile") {
      const lastMessage = event.messages.at(-1);
      const wantsToSave =
        lastMessage?.content === "Tak, chcę zapisać profil" ||
        lastMessage?.content === "Tak";

      if (wantsToSave) {
        // Użytkownik chce zapisać - zadaj pytanie o nazwę
        await this.chatSessionRepository.update(
          { chatId: event.chatId },
          {
            phase: "ask_profile_name",
            saveProfileChoice: true,
          },
        );

        const profileNameQuestion =
          "Jak chcesz nazwać ten profil? (np. 'Mama', 'Partner', 'Najlepsza przyjaciółka')";
        const profileNameAnswers = {
          type: "long_free_text" as const,
        };

        const questionEvent = new ChatQuestionAskedEvent(
          event.chatId,
          profileNameQuestion,
          profileNameAnswers,
        );
        this.questionAskedEventBus.emit(
          ChatQuestionAskedEvent.name,
          questionEvent,
        );
        return;
      } else {
        // Użytkownik nie chce zapisywać - zakończ z save_profile=false
        this.logger.log(
          `User chose not to save profile for chat ${event.chatId}`,
        );

        const output = session.pendingProfileData as EndConversationOutput;

        this.logger.log(
          `Pending profile data for chat ${event.chatId}: ${JSON.stringify(output)}`,
        );

        const finalOutput: EndConversationOutput = {
          ...output,
          save_profile: false,
          profile_name: null,
        };

        await this.chatSessionRepository.update(
          { chatId: event.chatId },
          { phase: "completed" },
        );

        const interviewEvent = new ChatInterviewCompletedEvent(
          event.chatId,
          finalOutput,
        );

        this.logger.log(
          `Emitting ChatInterviewCompletedEvent for chat ${event.chatId} (not saving profile)`,
        );

        this.interviewCompletedEventBus.emit(
          ChatInterviewCompletedEvent.name,
          interviewEvent,
        );

        const notifyEvent = new ChatCompletedNotifyUserEvent(event.chatId);
        this.chatCompletedNotifyUserEventBus.emit(
          ChatCompletedNotifyUserEvent.name,
          notifyEvent,
        );

        this.logger.log(
          `Completed handling "no save" choice for chat ${event.chatId}`,
        );

        return;
      }
    }

    // Obsługa pytania o nazwę profilu
    if (session.phase === "ask_profile_name") {
      const lastMessage = event.messages.at(-1);
      const profileName = lastMessage?.content ?? "";

      const output = session.pendingProfileData as EndConversationOutput;

      this.logger.log(
        `Pending profile data for chat ${event.chatId}: ${JSON.stringify(output)}`,
      );

      const finalOutput: EndConversationOutput = {
        ...output,
        save_profile: true,
        profile_name: profileName,
      };

      this.logger.log(
        `Final output for chat ${event.chatId}: save_profile=${String(finalOutput.save_profile)}, profile_name=${String(finalOutput.profile_name)}`,
      );

      await this.chatSessionRepository.update(
        { chatId: event.chatId },
        { phase: "completed" },
      );

      const interviewEvent = new ChatInterviewCompletedEvent(
        event.chatId,
        finalOutput,
      );

      this.logger.log(
        `Emitting ChatInterviewCompletedEvent for chat ${event.chatId}`,
      );

      this.interviewCompletedEventBus.emit(
        ChatInterviewCompletedEvent.name,
        interviewEvent,
      );

      const notifyEvent = new ChatCompletedNotifyUserEvent(event.chatId);
      this.chatCompletedNotifyUserEventBus.emit(
        ChatCompletedNotifyUserEvent.name,
        notifyEvent,
      );

      this.logger.log(
        `Completed handling profile name for chat ${event.chatId}`,
      );

      return;
    }

    // Normalna faza wywiadu
    const occasion = await this.queryBus.execute(
      new GetOccasionQuery(event.chatId),
    );

    if (occasion == null) {
      throw new Error(`No occasion found for chat ${event.chatId}`);
    }
    this.logger.log(
      `Generating question for chat ${event.chatId} with occasion ${occasion}`,
    );

    await this.commandBus.execute(
      new GenerateQuestionCommand(event.chatId, occasion, event.messages),
    );
  }
}
