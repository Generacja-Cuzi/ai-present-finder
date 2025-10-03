import { SendUserMessageCommand } from "src/domain/commands/send-user-message.command";
import { StalkingAnalyzeRequestCommand } from "src/domain/commands/stalking-analyze-request.command";
import {
  SendMessageDto,
  sendMessageDtoSchema,
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
import { CommandBus } from '@nestjs/cqrs';
import { Body, Logger, Post } from '@nestjs/common';

@ApiExtraModels(SendMessageDtoDoc, StalkingAnalyzeRequestDtoDoc)
@ApiTags('restapi')
@Controller('restapi')
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @Post('stalking-request')
  @ApiOperation({
    summary: 'Request stalking analysis for provided social profiles',
  })
  @ApiResponse({ status: 200, description: 'Analysis requested' })
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Send chat messages to the system' })
  @ApiResponse({ status: 200, description: 'Message accepted' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const validated = sendMessageDtoSchema.parse(sendMessageDto);
    await this.commandBus.execute(new SendUserMessageCommand(validated));
  }
}
function Controller(arg0: string): (target: typeof RestApiController) => void | typeof RestApiController {
  throw new Error("Function not implemented.");
}

