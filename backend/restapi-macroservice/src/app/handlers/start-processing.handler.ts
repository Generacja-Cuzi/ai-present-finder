import {
  ChatStartInterviewEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

import { StartProcessingCommand } from "../../domain/commands/start-processing.command";
import { GetUserProfileByIdQuery } from "../../domain/queries/get-user-profile-by-id.query";
import { IChatRepository } from "../../domain/repositories/ichat.repository";

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
    private readonly chatRepository: IChatRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: StartProcessingCommand) {
    const { analyzeRequestedDto, userId } = command;

    // Create chat entity at the beginning and ensure it's persisted before emitting events
    const chat = await this.chatRepository.create({
      chatId: analyzeRequestedDto.chatId,
      chatName: `Chat ${new Date().toLocaleDateString()}`,
      userId,
    });

    this.logger.log(`Created chat: ${JSON.stringify(chat)}`);

    // Verify chat was created successfully
    const verifiedChat = await this.chatRepository.findByChatId(
      analyzeRequestedDto.chatId,
    );
    if (verifiedChat === null) {
      throw new Error(
        `Failed to create chat with chatId: ${analyzeRequestedDto.chatId}`,
      );
    }

    this.logger.log(`Verified chat exists in DB: ${verifiedChat.id}`);

    // Load user profile if profileId is provided
    let userProfile;
    if (analyzeRequestedDto.profileId) {
      try {
        const profile = await this.queryBus.execute(
          new GetUserProfileByIdQuery(analyzeRequestedDto.profileId, userId),
        );
        userProfile = profile.profile;
        this.logger.log(
          `Loaded user profile ${analyzeRequestedDto.profileId} for chat`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to load profile ${analyzeRequestedDto.profileId}: ${error}`,
        );
      }
    }

    // Now it's safe to emit events - chat exists in database
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
      analyzeRequestedDto.occasion,
      userProfile,
    );
    this.chatEventBus.emit(ChatStartInterviewEvent.name, interviewEvent);
    this.logger.log(
      `Published interview event: ${JSON.stringify(interviewEvent)}`,
    );
  }
}
