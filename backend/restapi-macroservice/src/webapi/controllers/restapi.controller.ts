import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StalkingAnalyzeRequestCommand } from "src/domain/commands/stalking-analyze-request.command";
import { SendMessageDto } from "src/domain/models/send-message.dto";
import {
  StalkingAnalyzeRequestDto,
  StalkingAnalyzeRequestDto as StalkingAnalyzeRequestDtoDocument,
} from "src/domain/models/stalking-analyze-request.dto";

import { Body, Controller, Logger, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("restapi")
@ApiExtraModels(StalkingAnalyzeRequestDtoDocument)
@Controller("restapi")
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post("stalking-request")
  @ApiOperation({
    summary: "Request stalking analysis for provided social profiles",
  })
  @ApiOkResponse({ description: "Analysis requested" })
  async create(
    @Body() analyzeRequestedDto: StalkingAnalyzeRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto), // TODO(simon-the-shark): validate analyzeRequestedDto
    );
  }

  @Post("send-message")
  @ApiOperation({ summary: "Send chat messages to the system" })
  @ApiOkResponse({ description: "Message accepted" })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<void> {
    await this.commandBus.execute(new SendUserMessageCommand(sendMessageDto)); // TODO(simon-the-shark): validate sendMessageDto
  }
}
