// src/webapi/controllers/order.controller.ts
import { EndConversationOutputDocument } from "src/app/ai/types";
import { ChatMessageDtoDocument } from "src/domain/models/chat-message";
import { ContextDto, ContextDtoDocument } from "src/domain/models/context.dto";

import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiExtraModels, ApiTags } from "@nestjs/swagger";

@ApiExtraModels(
  ChatMessageDtoDocument,
  ContextDtoDocument,
  EndConversationOutputDocument,
)
@ApiTags("chat")
@Controller("chat")
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
