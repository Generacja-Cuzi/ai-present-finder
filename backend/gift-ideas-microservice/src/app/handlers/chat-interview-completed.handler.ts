import { ChatInterviewCompletedEvent } from "@core/events";
import { UpdateInterviewStatusCommand } from "src/domain/commands/update-interview-status.command";

import { Controller, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatInterviewCompletedHandler {
  private readonly logger = new Logger(ChatInterviewCompletedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatInterviewCompletedEvent.name)
  async handle(event: ChatInterviewCompletedEvent) {
    this.logger.log(
      `Handling chat interview completed event for chat ${event.chatId}`,
    );

    await this.commandBus.execute(
      new UpdateInterviewStatusCommand(
        event.chatId,
        event.profile.recipient_profile,
      ),
    );
  }
}
