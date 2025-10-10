import { ChatInterviewCompletedEvent } from "@core/events";
import { EndInterviewCommand } from "src/domain/commands/end-interview.command";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatInterviewCompletedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatInterviewCompletedEvent.name)
  async handle(event: ChatInterviewCompletedEvent) {
    await this.commandBus.execute(
      new EndInterviewCommand(event.context, event.profile),
    );
  }
}
