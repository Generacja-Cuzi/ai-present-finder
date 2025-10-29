import { ChatInterviewCompletedEvent } from "@core/events";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatInterviewCompletedHandler {
  private readonly logger = new Logger(ChatInterviewCompletedHandler.name);

  @EventPattern(ChatInterviewCompletedEvent.name)
  async handle(event: ChatInterviewCompletedEvent) {
    this.logger.log(
      `ChatInterviewCompleted event received for chatId: ${event.chatId} - ignoring (profile will be saved with GiftReadyEvent)`,
    );
    // Handler usunięty - profil użytkownika jest zapisywany w GiftReadyHandler
    // wraz z informacjami save_profile i profile_name
  }
}
