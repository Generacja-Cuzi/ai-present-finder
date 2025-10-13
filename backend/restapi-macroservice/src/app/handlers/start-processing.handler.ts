import {
  ChatStartInterviewEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { StartProcessingCommand } from "../../domain/commands/start-processing.command";

@CommandHandler(StartProcessingCommand)
export class StartProcessingCommandHandler
  implements ICommandHandler<StartProcessingCommand>
{
  private readonly logger = new Logger(StartProcessingCommandHandler.name);
  constructor(
    @Inject("STALKING_ANALYZE_REQUESTED_EVENT")
    private readonly stalkingEventBus: ClientProxy,
    @Inject("CHAT_START_INTERVIEW_EVENT")
    private readonly chatEventBus: ClientProxy,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: StartProcessingCommand) {
    const { analyzeRequestedDto } = command;

    // Start stalking
    const stalkingEvent = new StalkingAnalyzeRequestedEvent(
      analyzeRequestedDto.instagramUrl,
      analyzeRequestedDto.tiktokUrl,
      analyzeRequestedDto.xUrl,
      analyzeRequestedDto.chatId,
    );

    this.stalkingEventBus.emit(
      StalkingAnalyzeRequestedEvent.name,
      stalkingEvent,
    );
    this.logger.log(
      `Published stalking event: ${JSON.stringify(stalkingEvent)}`,
    );

    const interviewEvent = new ChatStartInterviewEvent(
      analyzeRequestedDto.chatId,
    );
    this.chatEventBus.emit(ChatStartInterviewEvent.name, interviewEvent);
    this.logger.log(
      `Published interview event: ${JSON.stringify(interviewEvent)}`,
    );
  }
}
