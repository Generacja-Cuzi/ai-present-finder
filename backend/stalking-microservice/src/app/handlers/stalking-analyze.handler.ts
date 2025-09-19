import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StalkingAnalyzeCommand } from 'src/domain/commands/stalking-analyze.command';
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

    // TODO(simon-the-sharp): Remove this after proper implementation. this is just for testing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    this.logger.log('Stalking completed.');

    const keywords = ['klapki', 'czerwone', 'nike'];

    const completedAt = new Date();

    const event = new StalkingCompletedEvent(
      keywords,
      completedAt,
      command.stalkingAnalyzeRequestDto.chatId,
    );

    this.eventBus.emit(StalkingCompletedEvent.name, event);
    this.logger.log(`Published event: ${JSON.stringify(event)}`);

    return Promise.resolve();
  }
}
