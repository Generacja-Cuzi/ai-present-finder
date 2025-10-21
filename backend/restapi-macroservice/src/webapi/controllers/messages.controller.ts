import { GetChatMessagesQuery } from "src/domain/queries/get-chat-messages.query";
import {
  ChatMessagesResponseDto,
  MessageDto,
} from "src/webapi/dtos/message.dto";

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";

@ApiTags("messages")
@ApiBearerAuth()
@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("chat/:chatId")
  @ApiOperation({ summary: "Get all messages for a specific chat" })
  @ApiOkResponse({
    description: "List of chat messages",
    type: ChatMessagesResponseDto,
  })
  async getChatMessages(
    @Param("chatId") chatId: string,
  ): Promise<ChatMessagesResponseDto> {
    const messages = await this.queryBus.execute(
      new GetChatMessagesQuery(chatId),
    );

    const messageDtos: MessageDto[] = messages.map((message) => ({
      id: message.id,
      chatId: message.chatId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    }));

    return { messages: messageDtos };
  }
}
