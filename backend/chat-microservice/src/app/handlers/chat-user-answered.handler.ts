/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags */
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { ChatUserAnsweredEvent } from "src/domain/events/chat-user-answered.event";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatUserAnsweredHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent): Promise<void> {
    await this.commandBus.execute(
      new GenerateQuestionCommand(event.context, event.messages),
    );
  }
}
