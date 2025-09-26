import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StalkingAnalyzeRequestCommand } from "src/domain/commands/stalking-analyze-request.command";
import {
  SendMessageDto,
  sendMessageDtoSchema,
<<<<<<< HEAD
} from "src/domain/models/send-message.dto";
import { StalkingAnalyzeRequestDto } from "src/domain/models/stalking-analyze-request.dto";

import { Body, Controller, Logger, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

@Controller("restapi")
=======
} from 'src/domain/models/send-message.dto';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';
import {
  ApiTags,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SendMessageDtoDoc } from 'src/domain/models/send-message.dto';
import { StalkingAnalyzeRequestDto as StalkingAnalyzeRequestDtoDoc } from 'src/domain/models/stalking-analyze-request.dto';

@ApiExtraModels(SendMessageDtoDoc, StalkingAnalyzeRequestDtoDoc)
@ApiTags('restapi')
@Controller('restapi')
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);
  constructor(private readonly commandBus: CommandBus) {}

<<<<<<< HEAD
  @Post("stalking-request")
=======
  @Post('stalking-request')
  @ApiOperation({
    summary: 'Request stalking analysis for provided social profiles',
  })
  @ApiResponse({ status: 200, description: 'Analysis requested' })
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }

<<<<<<< HEAD
  @Post("send-message")
=======
  @Post('send-message')
  @ApiOperation({ summary: 'Send chat messages to the system' })
  @ApiResponse({ status: 200, description: 'Message accepted' })
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const validated = sendMessageDtoSchema.parse(sendMessageDto);
    await this.commandBus.execute(new SendUserMessageCommand(validated));
  }
}
