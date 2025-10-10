import { ChatUserAnsweredEvent } from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatUserAnsweredHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent): Promise<void> {
    await this.commandBus.execute(
      new GenerateQuestionCommand(event.chatId, event.messages),
    );
  }
}
