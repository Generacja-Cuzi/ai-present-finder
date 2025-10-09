import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("reranking")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message for the Reranking microservice",
  })
  @ApiOkResponse({
    description: "Returns a welcome message from the Reranking service",
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
