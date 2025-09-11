// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AnalyzeRequestCommand } from 'src/domain/commands/analyze-request.command';
import { AnalyzeRequestDto } from 'src/domain/models/analyze-request.dto';

@Controller('restapi')
export class RestApiController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() analyzeRequestedDto: AnalyzeRequestDto) {
    return this.commandBus.execute(
      new AnalyzeRequestCommand(analyzeRequestedDto),
    );
  }
}
