import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestedEvent } from '../../domain/events/stalking-analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StalkingAnalyzeCommand } from 'src/domain/commands/stalking-analyze.command';
import { log } from 'console';
import { StalkingCompletedEvent } from 'src/domain/events/stalking-completed.event';

@CommandHandler(StalkingAnalyzeCommand)
export class StalkingAnalyzeHandler
  implements ICommandHandler<StalkingAnalyzeCommand>
{
  private readonly logger = new Logger(StalkingAnalyzeHandler.name);
  constructor(
    @Inject('STALKING_COMPLETED_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: StalkingAnalyzeCommand) {
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
