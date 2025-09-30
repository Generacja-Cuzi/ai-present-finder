import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { ChatQuestionAskedEvent } from "src/domain/events/chat-question-asked.event";
import { v4 as uuidv4 } from "uuid";

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
      new NotifyUserSseCommand(event.context.chatId, {
        type: "chatbot-message",
        message: {
          id: uuidv4(),
          content: event.question,
          sender: "assistant",
        },
      }),
    );

    return Promise.resolve();
  }
}
