import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestCommand } from 'src/domain/commands/stalking-analyze-request.command';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';

@Controller('restapi')
export class RestApiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    await this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }
}
