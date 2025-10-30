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
import { ResourceOwnershipGuard } from "../../app/guards/resource-ownership.guard";
import { RolesGuard } from "../../app/guards/roles.guard";
import { RequireResourceOwnership } from "../../domain/decorators/resource-ownership.decorator";
import { Roles } from "../../domain/decorators/roles.decorator";
import { UserRole } from "../../domain/entities/user.entity";
import { ResourceType } from "../../domain/models/resource-ownership.types";

@ApiTags("messages")
@ApiBearerAuth()
@Controller("messages")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
export class MessagesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("chat/:chatId")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @RequireResourceOwnership({
    resourceType: ResourceType.CHAT,
    paramName: "chatId",
  })
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
      proposedAnswers: message.proposedAnswers,
      createdAt: message.createdAt,
    }));

    return { messages: messageDtos };
  }
}
