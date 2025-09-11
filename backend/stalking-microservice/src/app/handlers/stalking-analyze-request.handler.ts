import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { StalkingAnalyzeRequestedEvent } from '../../domain/events/stalking-analyze-request.event';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';
import { StalkingAnalyzeCommand } from 'src/domain/commands/stalking-analyze.command';

@Controller()
export class StalkingAnalyzeRequestHandler {
  private readonly logger = new Logger(StalkingAnalyzeRequestHandler.name);
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(StalkingAnalyzeRequestedEvent.name)
  async handle(event: StalkingAnalyzeRequestedEvent) {
    const analyzeRequestedDto: StalkingAnalyzeRequestDto = {
      facebookUrl: event.facebookUrl,
      instagramUrl: event.instagramUrl,
      tiktokUrl: event.tiktokUrl,
      youtubeUrl: event.youtubeUrl,
      xUrl: event.xUrl,
      linkedinUrl: event.linkedinUrl,
    };

    this.commandBus.execute(
      new StalkingAnalyzeCommand(analyzeRequestedDto),
    );
    return event;
  }
}
