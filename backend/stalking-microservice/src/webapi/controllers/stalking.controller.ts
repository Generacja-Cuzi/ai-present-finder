// src/webapi/controllers/order.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';

@ApiExtraModels(StalkingAnalyzeRequestDto)
@ApiTags('stalking')
@Controller('stalking')
export class StalkingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
