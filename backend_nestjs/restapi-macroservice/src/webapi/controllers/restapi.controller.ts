// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { StalkingAnalyzeRequestCommand } from 'src/domain/commands/stalking-analyze-request.command';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';

@Controller('restapi')
export class RestApiController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() analyzeRequestedDto: StalkingAnalyzeRequestDto) {
    return this.commandBus.execute(
      new StalkingAnalyzeRequestCommand(analyzeRequestedDto),
    );
  }
}
