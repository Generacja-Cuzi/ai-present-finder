import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestCommand } from 'src/domain/commands/stalking-analyze-request.command';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';
import { NotifyUserSseCommand } from 'src/domain/commands/notify-user-sse.command';
import { NotifyUserSseDto } from 'src/domain/models/notify-user-sse.dto';

@Controller('restapi')
export class RestApiController {
  private readonly logger = new Logger(RestApiController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }

  @Post('notify')
  async notifyUser(@Body() notifyUserSseDto: NotifyUserSseDto) {
    this.logger.log(
      'notify endpoint demo test ' + JSON.stringify(notifyUserSseDto),
    );
    await this.commandBus.execute(
      new NotifyUserSseCommand(
        notifyUserSseDto.userId,
        notifyUserSseDto.message,
      ),
    );
  }
}
