import { ChatInterviewCompletedEvent } from "@core/events";
import { SaveUserProfileCommand } from "src/domain/commands/save-user-profile.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatInterviewCompletedHandler {
  private readonly logger = new Logger(ChatInterviewCompletedHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly chatRepository: IChatRepository,
  ) {}

  @EventPattern(ChatInterviewCompletedEvent.name)
  async handle(event: ChatInterviewCompletedEvent) {
    this.logger.log(
      `ChatInterviewCompleted event received for chatId: ${event.chatId}`,
    );

    // Get chat details to find the userId
    const chat = await this.chatRepository.findByChatId(event.chatId);
    if (chat === null) {
      this.logger.warn(
        `Chat with ID ${event.chatId} not found when trying to save user profile`,
      );
      return;
    }

    // Check if user wants to save the profile
    if (!event.profile.save_profile) {
      this.logger.log(
        `User chose not to save profile for chat ${event.chatId}`,
      );
      return;
    }

    // Extract profile name from the user's input or use default
    const profileName =
      event.profile.profile_name ??
      event.profile.recipient_profile.personal_info.person_name ??
      event.profile.recipient_profile.personal_info.relationship ??
      "Unknown";

    this.logger.log(
      `Saving user profile with name: ${profileName} for user ${chat.userId}`,
    );

    // Save the user profile
    await this.commandBus.execute(
      new SaveUserProfileCommand(
        chat.userId,
        event.chatId,
        profileName,
        event.profile.recipient_profile,
        event.profile.key_themes_and_keywords,
      ),
    );

    this.logger.log(
      `User profile saved for user ${chat.userId}, chat ${event.chatId}`,
    );
  }
}
