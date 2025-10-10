import { ChatCompletedNotifyUserEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatCompletedNotifyUserHandler {
  private readonly logger = new Logger(ChatCompletedNotifyUserHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatCompletedNotifyUserEvent.name)
  async handle(event: ChatCompletedNotifyUserEvent) {
    this.logger.log(`Chat interview completed, notifying user`);

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "chat-interview-completed",
      }),
    );
  }
}
