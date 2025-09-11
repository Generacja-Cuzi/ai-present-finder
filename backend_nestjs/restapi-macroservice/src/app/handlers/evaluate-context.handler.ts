import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AnalyzeRequestCommand } from '../../domain/commands/analyze-request.command';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EvaluateContextCommand } from 'src/domain/commands/evaluate-context.command';

@CommandHandler(EvaluateContextCommand)
export class EvaluateContextHandler
  implements ICommandHandler<EvaluateContextCommand>
{
  private readonly logger = new Logger(EvaluateContextHandler.name);
  constructor(
    @Inject('ASK_QUESTION_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: EvaluateContextCommand) {
    const { context } = command;

    const enoughContext = true;
    const chatIterations = 3;

    this.eventBus.emit(AnalyzeRequestedEvent.name, event);

    this.logger.log(`Published event: ${event}`);

    return event;
  }
}
