import type { Chat } from "src/domain/entities/chat.entity";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetChatListingsQuery } from "src/domain/queries/get-chat-listings.query";
import { GetUserChatsQuery } from "src/domain/queries/get-user-chats.query";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import { ChatListingsResponseDto } from "src/webapi/dtos/chat-listings.dto";

import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";
import { ResourceOwnershipGuard } from "../../app/guards/resource-ownership.guard";
import { RolesGuard } from "../../app/guards/roles.guard";
import { RequireResourceOwnership } from "../../domain/decorators/resource-ownership.decorator";
import { Roles } from "../../domain/decorators/roles.decorator";
import { UserRole } from "../../domain/entities/user.entity";
import { ChatsResponseDto } from "../../domain/models/chat.dto";
import { ResourceType } from "../../domain/models/resource-ownership.types";

@ApiTags("chats")
@Controller("chats")
export class ChatController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly listingRepository: IListingRepository,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
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
        isInterviewCompleted:
          chat.isInterviewCompleted ||
          (Boolean(chat.listings) && chat.listings.length > 0),
      })),
    };
  }

  @Get(":chatId/listings")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER)
  @RequireResourceOwnership({
    resourceType: ResourceType.CHAT,
    paramName: "chatId",
  })
  @ApiOperation({ summary: "Get listings for a specific chat" })
  @ApiOkResponse({
    description: "Returns list of listings with favorite status",
    type: ChatListingsResponseDto,
  })
  async getChatListings(
    @Param("chatId") chatId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<ChatListingsResponseDto> {
    const listings = await this.queryBus.execute(
      new GetChatListingsQuery(chatId, request.user.id),
    );

    const user = request.user;

    const listingsWithFavoriteStatus = await Promise.all(
      listings.map(async (listing) => {
        const isFavorited =
          await this.listingRepository.isListingFavoritedByUser(
            user.id,
            listing.id,
          );

        return {
          id: listing.id,
          chatId: listing.chatId,
          image: listing.image,
          title: listing.title,
          description: listing.description,
          link: listing.link,
          price: {
            value: listing.priceValue,
            label: listing.priceLabel,
            currency: listing.priceCurrency,
            negotiable: listing.priceNegotiable,
          },
          category: listing.category,
          provider: listing.provider,
          isFavorited,
          createdAt: listing.createdAt,
        };
      }),
    );

    return {
      listings: listingsWithFavoriteStatus,
    };
  }
}
