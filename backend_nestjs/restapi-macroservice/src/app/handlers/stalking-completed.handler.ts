import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';
import { ContextDto } from 'src/domain/models/context.dto';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';

@Controller()
export class StalkingCompletedHandler {
  private readonly logger = new Logger(StalkingCompletedHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(StalkingCompletedEvent.name)
  async handle(event: StalkingCompletedEvent) {
    const { keywords } = event;

    const context: ContextDto = {
      keywords: keywords,
    };
    this.commandBus.execute(new EvaluateContextCommand(context));
    return event;
  }
}
