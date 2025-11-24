import { Response } from "express";
import { Observable } from "rxjs";
import { SseService } from "src/app/services/sse-service";
import { RegisterUserSseDto } from "src/domain/models/register-user-sse.dto";
import {
  SseChatInappropriateRequestDto,
  SseChatInterviewCompletedDto,
  SseChatbotMessageDto,
  SseGiftReadyDto,
  SseMessageDto,
} from "src/domain/models/sse-message.dto";

import { Controller, Logger, Query, Res, Sse } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiExtraModels(
  SseChatbotMessageDto,
  SseChatInterviewCompletedDto,
  SseChatInappropriateRequestDto,
  SseGiftReadyDto,
)
@ApiTags("sse")
@Controller()
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(private readonly sseService: SseService) {}

  @Sse("sse")
  @ApiOperation({ summary: "Subscribe to server-sent events stream" })
  @ApiQuery({
    name: "clientId",
    required: true,
    description: "Client identifier to register for SSE",
  })
  @ApiResponse({ status: 200, description: "Event stream of SSE messages" })
  sse(
    @Query() query: RegisterUserSseDto,
    @Res() response: Response,
  ): Observable<MessageEvent<SseMessageDto>> {
    if (!query.clientId) {
      throw new Error("query.clientId is required");
    }

    this.logger.log(
      `SSE connection established for clientId: ${query.clientId}`,
    );
    this.sseService.addUser(query.clientId);
    response.on("close", () => {
      this.logger.log(`SSE connection closed for clientId: ${query.clientId}`);
      this.sseService.removeUser(query.clientId);
    });
    return this.sseService.events(query.clientId);
  }
}
