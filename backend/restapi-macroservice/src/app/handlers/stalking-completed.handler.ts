import { CommandBus } from '@nestjs/cqrs';

import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';
import { ContextDto } from 'src/domain/models/context.dto';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';

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
    await this.commandBus.execute(new EvaluateContextCommand(context));
  }
}
