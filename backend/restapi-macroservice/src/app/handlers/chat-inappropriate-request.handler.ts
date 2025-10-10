import { ChatInappropriateRequestEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatInappropriateRequestHandler {
  private readonly logger = new Logger(ChatInappropriateRequestHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatInappropriateRequestEvent.name)
  async handle(event: ChatInappropriateRequestEvent) {
    this.logger.log(
      `Inappropriate request detected(chatId: ${event.chatId}) : ${event.reason}`,
    );
    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "chat-inappropriate-request",
        reason: event.reason,
      }),
    );
  }
}
