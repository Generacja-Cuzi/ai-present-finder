import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StalkingAnalyzeRequestedCommand } from 'src/domain/commands/stalking-analyze-requested.command';
import { log } from 'console';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';

@CommandHandler(StalkingAnalyzeRequestedCommand)
export class StalkingAnalyzeRequestHandler
  implements ICommandHandler<StalkingAnalyzeRequestedCommand>
{
  private readonly logger = new Logger(StalkingAnalyzeRequestHandler.name);
  constructor(
    @Inject('STALKING_COMPLETED_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: StalkingAnalyzeRequestedCommand) {
    this.logger.log('Starting stalking analysis...');
    this.logger.log('Stalking completed.');

    const keywords = ['example', 'keywords', 'from', 'stalking'];
    const completedAt = new Date();

    const event = new StalkingCompletedEvent(keywords, completedAt);

    this.eventBus.emit(StalkingCompletedEvent.name, event);
    this.logger.log(`Published event: ${event}`);

    return event;
  }
}
