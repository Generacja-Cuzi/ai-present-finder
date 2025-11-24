import { ChatCompletedNotifyUserEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { IChatRepository } from "src/domain/repositories/ichat.repository";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatCompletedNotifyUserHandler {
  private readonly logger = new Logger(ChatCompletedNotifyUserHandler.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly chatRepository: IChatRepository,
  ) {}

  @EventPattern(ChatCompletedNotifyUserEvent.name)
  async handle(event: ChatCompletedNotifyUserEvent) {
    this.logger.log(`Chat interview completed, notifying user`);

    // Mark the chat as completed in the database
    const chat = await this.chatRepository.findByChatId(event.chatId);
    if (chat === null) {
      this.logger.warn(
        `Chat with ID ${event.chatId} not found when trying to mark as completed`,
      );
      return;
    }

    await this.chatRepository.update(chat.id, {
      isInterviewCompleted: true,
      status: "searching",
    });
    this.logger.log(
      `Marked chat ${event.chatId} as completed and searching for gifts`,
    );

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "chat-interview-completed",
      }),
    );
  }
}
