import { EvaluateContextCommand } from "src/domain/commands/evaluate-context.command";
import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";
import { StalkingCompletedEvent } from "src/domain/events/stalking-completed.event";
import { ContextDto } from "src/domain/models/context.dto";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class StalkingCompletedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(StalkingCompletedEvent.name)
  async handle(event: StalkingCompletedEvent) {
    const { keywords } = event;

    const context: ContextDto = {
      keywords: keywords,
      chatId: event.chatId,
    };
    await this.commandBus.execute(
      new NotifyUserSseCommand(event.chatId, {
        type: "stalking-completed",
      }),
    );
    await this.commandBus.execute(new EvaluateContextCommand(context));
  }
}
