import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Amazon")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message for the Amazon microservice",
  })
  @ApiOkResponse({ description: "Welcome message", type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  @ApiOperation({
    summary: "Health check endpoint",
  })
  @ApiOkResponse({ description: "Service health status", type: Object })
  getHealth(): object {
    return { status: "ok", service: "amazon-microservice" };
  }
}
