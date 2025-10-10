import { ChatQuestionAskedEvent } from "@core/events";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { ulid } from "ulid";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatQuestionAskedHandler {
  private readonly logger = new Logger(ChatQuestionAskedHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatQuestionAskedEvent.name)
  async handle(event: ChatQuestionAskedEvent) {
    this.logger.log(`sending assistant message to user`);

    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "chatbot-message",
        message: {
          id: ulid(),
          content: event.question,
          sender: "assistant",
        },
      }),
    );
  }
}
