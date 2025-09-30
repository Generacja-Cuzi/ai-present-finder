import { Response } from "express";
import { Observable } from "rxjs";
import { SseService } from "src/app/services/sse-service";
import { RegisterUserSseDto } from "src/domain/models/register-user-sse.dto";
import type { SseMessageDto } from "src/domain/models/sse-message.dto";

import { Controller, Query, Res, Sse } from "@nestjs/common";

@Controller()
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse("sse")
  sse(
    @Query() query: RegisterUserSseDto,
    @Res() response: Response,
  ): Observable<MessageEvent<SseMessageDto>> {
    if (!query.clientId) {
      throw new Error("query.clientId is required");
    }

    this.sseService.addUser(query.clientId);
    response.on("close", () => {
      this.sseService.removeUser(query.clientId);
    });
    return this.sseService.events(query.clientId);
  }
}
