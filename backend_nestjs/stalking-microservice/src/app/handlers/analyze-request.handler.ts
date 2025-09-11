import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { AnalyzeRequestedEvent } from '../../domain/events/analyze-request.event';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { AnalyzeRequestDto } from 'src/domain/models/analyze-request.dto';
import { StalkingAnalyzeRequestedCommand } from 'src/domain/commands/stalking-analyze-requested.command';

@Controller()
export class AnalyzeRequestHandler {
  private readonly logger = new Logger(AnalyzeRequestHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(AnalyzeRequestedEvent.name)
  async handle(event: AnalyzeRequestedEvent) {
    const analyzeRequestedDto: AnalyzeRequestDto = {
      facebookUrl: event.facebookUrl,
      instagramUrl: event.instagramUrl,
      tiktokUrl: event.tiktokUrl,
      youtubeUrl: event.youtubeUrl,
      xUrl: event.xUrl,
      linkedinUrl: event.linkedinUrl,
    };

    this.commandBus.execute(
      new StalkingAnalyzeRequestedCommand(analyzeRequestedDto),
    );
    return event;
  }
}
