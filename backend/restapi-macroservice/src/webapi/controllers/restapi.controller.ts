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
import { ResourceOwnershipGuard } from "../../app/guards/resource-ownership.guard";
import { RolesGuard } from "../../app/guards/roles.guard";
import { RequireResourceOwnership } from "../../domain/decorators/resource-ownership.decorator";
import { Roles } from "../../domain/decorators/roles.decorator";
import { UserRole } from "../../domain/entities/user.entity";
import {
  ResourceIdLocation,
  ResourceType,
} from "../../domain/models/resource-ownership.types";

@ApiTags("restapi")
@ApiExtraModels(PotencialAnswersSelectDto, PotencialAnswersFreeTextDto)
@Controller("restapi")
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post("stalking-request")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @RequireResourceOwnership({
    resourceType: ResourceType.CHAT,
    paramName: "chatId",
    location: ResourceIdLocation.BODY,
  })
  @ApiOperation({ summary: "Send chat messages to the system" })
  @ApiOkResponse({ description: "Message accepted" })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<void> {
    this.logger.log(
      `Sending message to the system: ${JSON.stringify(sendMessageDto)}`,
    );
    await this.commandBus.execute(new SendUserMessageCommand(sendMessageDto)); // TODO(simon-the-shark): validate sendMessageDto
  }
}
