import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StalkingAnalyzeRequestCommand } from "src/domain/commands/stalking-analyze-request.command";
import {
  SendMessageDto,
  sendMessageDtoSchema,
} from "src/domain/models/send-message.dto";
import { StalkingAnalyzeRequestDto } from "src/domain/models/stalking-analyze-request.dto";

import { Body, Controller, Logger, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

@Controller("restapi")
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @Post("stalking-request")
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }

  @Post("send-message")
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const validated = sendMessageDtoSchema.parse(sendMessageDto);
    await this.commandBus.execute(new SendUserMessageCommand(validated));
  }
}
