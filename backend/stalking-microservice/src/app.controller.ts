import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Stalking")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message for the Stalking microservice",
  })
  @ApiOkResponse({ description: "Welcome message", type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
