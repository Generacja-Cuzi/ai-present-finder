import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StartProcessingCommand } from "src/domain/commands/start-processing.command";
import { SendMessageDto } from "src/domain/models/send-message.dto";
import {
  StalkingAnalyzeRequestDto,
  StalkingAnalyzeRequestDto as StalkingAnalyzeRequestDtoDocument,
} from "src/domain/models/stalking-analyze-request.dto";

import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";

@ApiTags("restapi")
@ApiExtraModels(StalkingAnalyzeRequestDtoDocument)
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
  ): Promise<void> {
    await this.commandBus.execute(
      new StartProcessingCommand(analyzeRequestedDto), // TODO(simon-the-shark): validate analyzeRequestedDto
    );
  }

  @Post("send-message")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Send chat messages to the system" })
  @ApiOkResponse({ description: "Message accepted" })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<void> {
    await this.commandBus.execute(new SendUserMessageCommand(sendMessageDto)); // TODO(simon-the-shark): validate sendMessageDto
  }
}
