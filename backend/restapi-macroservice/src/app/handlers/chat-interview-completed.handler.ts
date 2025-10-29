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

    // Extract person name from profile or use default
    const personName =
      event.profile.recipient_profile.personal_info.person_name ??
      event.profile.recipient_profile.personal_info.relationship ??
      "Unknown";

    // Save the user profile
    await this.commandBus.execute(
      new SaveUserProfileCommand(
        chat.userId,
        event.chatId,
        personName,
        event.profile.recipient_profile,
        event.profile.key_themes_and_keywords,
      ),
    );

    this.logger.log(
      `User profile saved for user ${chat.userId}, chat ${event.chatId}`,
    );
  }
}
