import { StalkingAnalyzeRequestedEvent } from "@core/events";
import { StalkingAnalyzeCommand } from "src/domain/commands/stalking-analyze.command";
import { StalkingAnalyzeRequestDto } from "src/domain/models/stalking-analyze-request.dto";

import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class StalkingAnalyzeRequestHandler {
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
      chatId: event.chatId,
    };

    await this.commandBus.execute(
      new StalkingAnalyzeCommand(analyzeRequestedDto),
    );
  }
}
