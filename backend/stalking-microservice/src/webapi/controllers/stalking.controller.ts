// src/webapi/controllers/order.controller.ts
import { StalkingAnalyzeRequestDtoDocument } from "src/domain/models/stalking-analyze-request.dto";

import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiExtraModels, ApiTags } from "@nestjs/swagger";

@ApiExtraModels(StalkingAnalyzeRequestDtoDocument)
@ApiTags("stalking")
@Controller("stalking")
export class StalkingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
