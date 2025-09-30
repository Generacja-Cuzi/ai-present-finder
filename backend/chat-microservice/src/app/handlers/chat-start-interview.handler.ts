import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { ChatStartInterviewEvent } from "src/domain/events/chat-start-interview.event";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatStartInterviewHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(ChatStartInterviewEvent.name)
  async handle(event: ChatStartInterviewEvent) {
    await this.commandBus.execute(
      new GenerateQuestionCommand(event.context, [
        {
          sender: "user",
          content: "Hi!",
          id: "1",
        },
      ]),
    );
  }
}
