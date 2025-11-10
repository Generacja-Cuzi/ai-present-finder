import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Gift")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
