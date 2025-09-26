<<<<<<< HEAD
import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

@Controller("chat")
=======
// src/webapi/controllers/order.controller.ts
import { Controller, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { ChatMessageDto } from 'src/domain/models/chat-message';
import { ContextDto } from 'src/domain/models/context.dto';
import { EndConversationOutputDto } from 'src/app/ai/types';

@ApiExtraModels(ChatMessageDto, ContextDto, EndConversationOutputDto)
@ApiTags('chat')
@Controller('chat')
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
