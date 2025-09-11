import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AnalyzeRequestCommand } from '../../domain/commands/analyze-request.command';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@CommandHandler(AnalyzeRequestCommand)
export class AnalyzeRequestHandler
  implements ICommandHandler<AnalyzeRequestCommand>
{
  private readonly logger = new Logger(AnalyzeRequestHandler.name);
  constructor(
    @Inject('ANALYZE_REQUESTED_EVENT') private readonly eventBus: ClientProxy,
  ) {}

  async execute(command: AnalyzeRequestCommand) {
    const { analyzeRequestedDto } = command;

    const event = new AnalyzeRequestedEvent(
      analyzeRequestedDto.facebookUrl,
      analyzeRequestedDto.instagramUrl,
      analyzeRequestedDto.tiktokUrl,
      analyzeRequestedDto.youtubeUrl,
      analyzeRequestedDto.xUrl,
      analyzeRequestedDto.linkedinUrl,
    );

    this.eventBus.emit(AnalyzeRequestedEvent.name, event);

    this.logger.log(`Published event: ${event}`);

    return event;
  }
}
