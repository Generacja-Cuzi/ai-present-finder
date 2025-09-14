import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestCommand } from '../../domain/commands/stalking-analyze-request.command';
import { StalkingAnalyzeRequestedEvent } from '../../domain/events/stalking-analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@CommandHandler(StalkingAnalyzeRequestCommand)
export class StalkingAnalyzeRequestHandler
  implements ICommandHandler<StalkingAnalyzeRequestCommand>
{
  private readonly logger = new Logger(StalkingAnalyzeRequestHandler.name);
  constructor(
    @Inject('STALKING_ANALYZE_REQUESTED_EVENT')
    private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: StalkingAnalyzeRequestCommand) {
    const { analyzeRequestedDto } = command;

    const event = new StalkingAnalyzeRequestedEvent(
      analyzeRequestedDto.facebookUrl,
      analyzeRequestedDto.instagramUrl,
      analyzeRequestedDto.tiktokUrl,
      analyzeRequestedDto.youtubeUrl,
      analyzeRequestedDto.xUrl,
      analyzeRequestedDto.linkedinUrl,
    );

    this.eventBus.emit(StalkingAnalyzeRequestedEvent.name, event);

    this.logger.log(`Published event: ${JSON.stringify(event)}`);

    return Promise.resolve();
  }
}
