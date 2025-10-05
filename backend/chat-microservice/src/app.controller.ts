import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Chat")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Get welcome message from Chat service" })
  @ApiOkResponse({
    description: "Returns welcome message from Chat service",
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
