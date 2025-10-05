import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Gift")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message from the Gift microservice",
  })
  @ApiOkResponse({
    description: "A welcome message returned by the Gift service",
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
