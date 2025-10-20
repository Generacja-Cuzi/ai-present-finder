import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Gift")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message for the Gift microservice",
  })
  @ApiOkResponse({
    description: "Returns a welcome message from the Gift service",
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  @ApiOperation({
    summary: "Health check endpoint",
  })
  @ApiOkResponse({
    description: "Returns service health status",
    type: Object,
  })
  health(): { status: string } {
    return { status: "ok" };
  }
}
