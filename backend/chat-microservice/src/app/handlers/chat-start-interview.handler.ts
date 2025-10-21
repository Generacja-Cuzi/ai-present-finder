import { ChatStartInterviewEvent } from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { SetOccasionCommand } from "src/domain/commands/set-occasion.command";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatStartInterviewHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatStartInterviewEvent.name)
  async handle(event: ChatStartInterviewEvent): Promise<void> {
    await this.commandBus.execute(
      new SetOccasionCommand(event.chatId, event.occasion),
    );

    await this.commandBus.execute(
      new GenerateQuestionCommand(event.chatId, event.occasion, []),
    );
  }
}
