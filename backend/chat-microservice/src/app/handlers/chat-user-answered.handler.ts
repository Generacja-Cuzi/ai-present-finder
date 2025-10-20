import { ChatUserAnsweredEvent } from "@core/events";
import { GenerateQuestionCommand } from "src/domain/commands/generate-question.command";
import { GetOccasionQuery } from "src/domain/queries/get-occasion.query";

import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class ChatUserAnsweredHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(ChatUserAnsweredEvent.name)
  async handle(event: ChatUserAnsweredEvent): Promise<void> {
    const occasion = await this.queryBus.execute(
      new GetOccasionQuery(event.chatId),
    );

    if (occasion == null) {
      throw new Error(`No occasion found for chat ${event.chatId}`);
    }

    await this.commandBus.execute(
      new GenerateQuestionCommand(event.chatId, occasion, event.messages),
    );
  }
}
