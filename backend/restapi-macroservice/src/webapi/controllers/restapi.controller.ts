import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StartProcessingCommand } from "src/domain/commands/start-processing.command";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import {
  PotencialAnswersFreeTextDto,
  PotencialAnswersSelectDto,
} from "src/domain/models/chat-message.dto";
import { SendMessageDto } from "src/domain/models/send-message.dto";
import { StalkingAnalyzeRequestDto } from "src/domain/models/stalking-analyze-request.dto";

import { Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";

@ApiTags("restapi")
@ApiExtraModels(PotencialAnswersSelectDto, PotencialAnswersFreeTextDto)
@Controller("restapi")
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post("stalking-request")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Request stalking analysis for provided social profiles",
  })
  @ApiOkResponse({ description: "Analysis requested" })
  async create(
    @Body() analyzeRequestedDto: StalkingAnalyzeRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.commandBus.execute(
      new StartProcessingCommand(analyzeRequestedDto, request.user.id), // TODO(simon-the-shark): validate analyzeRequestedDto
    );
  }

  @Post("send-message")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Send chat messages to the system" })
  @ApiOkResponse({ description: "Message accepted" })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<void> {
    this.logger.log(
      `Sending message to the system: ${JSON.stringify(sendMessageDto)}`,
    );
    await this.commandBus.execute(new SendUserMessageCommand(sendMessageDto)); // TODO(simon-the-shark): validate sendMessageDto
  }
}
