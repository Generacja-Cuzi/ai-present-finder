// src/webapi/controllers/order.controller.ts
<<<<<<< HEAD
import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

@Controller("stalking")
=======
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { StalkingAnalyzeRequestDto } from 'src/domain/models/stalking-analyze-request.dto';

@ApiExtraModels(StalkingAnalyzeRequestDto)
@ApiTags('stalking')
@Controller('stalking')
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
export class StalkingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
