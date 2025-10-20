import type { Chat } from "src/domain/entities/chat.entity";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetUserChatsQuery } from "src/domain/queries/get-user-chats.query";

import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";
import { ChatsResponseDto } from "../../domain/models/chat.dto";

@ApiTags("chats")
@Controller("chats")
export class ChatController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user's chat history" })
  @ApiOkResponse({
    description: "Returns list of user's chats",
    type: ChatsResponseDto,
  })
  async getUserChats(
    @Req() request: AuthenticatedRequest,
  ): Promise<ChatsResponseDto> {
    const chatsResult = await this.queryBus.execute<GetUserChatsQuery, Chat[]>(
      new GetUserChatsQuery(request.user.id),
    );

    return {
      chats: chatsResult.map((chat) => ({
        chatId: chat.chatId,
        chatName: chat.chatName,
        createdAt: chat.createdAt,
      })),
    };
  }
}
