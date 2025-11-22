import { StartChatRefinementCommand } from "src/domain/commands/start-chat-refinement.command";
import type { Chat } from "src/domain/entities/chat.entity";
import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetChatListingsQuery } from "src/domain/queries/get-chat-listings.query";
import { GetChatWithListingsByIdQuery } from "src/domain/queries/get-chat-with-listings-by-id.query";
import { GetUserChatsQuery } from "src/domain/queries/get-user-chats.query";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import { ChatListingsResponseDto } from "src/webapi/dtos/chat-listings.dto";
import {
  StartChatRefinementDto,
  StartChatRefinementResponseDto,
  startChatRefinementDtoSchema,
} from "src/webapi/dtos/start-chat-refinement.dto";

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";
import { ResourceOwnershipGuard } from "../../app/guards/resource-ownership.guard";
import { RolesGuard } from "../../app/guards/roles.guard";
import { RequireResourceOwnership } from "../../domain/decorators/resource-ownership.decorator";
import { Roles } from "../../domain/decorators/roles.decorator";
import { UserRole } from "../../domain/entities/user.entity";
import { ChatDto, ChatsResponseDto } from "../../domain/models/chat.dto";
import { ResourceType } from "../../domain/models/resource-ownership.types";

@ApiTags("chats")
@Controller("chats")
export class ChatController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly listingRepository: IListingRepository,
  ) {}

  private mapChatToDto(chat: Chat): ChatDto {
    return {
      chatId: chat.chatId,
      chatName: chat.chatName,
      createdAt: chat.createdAt,
      isInterviewCompleted: chat.isInterviewCompleted,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      giftCount: chat.listings?.length ?? 0,
      status: chat.status,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
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

    return { chats: chatsResult.map((chat) => this.mapChatToDto(chat)) };
  }

  @Get(":chatId")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @RequireResourceOwnership({
    resourceType: ResourceType.CHAT,
    paramName: "chatId",
  })
  @ApiOperation({ summary: "Get a specific chat by ID" })
  @ApiOkResponse({
    description: "Returns the chat details",
    type: ChatDto,
  })
  async getChatById(
    @Param("chatId") chatId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<ChatDto> {
    const chat = await this.queryBus.execute<
      GetChatWithListingsByIdQuery,
      Chat
    >(new GetChatWithListingsByIdQuery(chatId, request.user.id));
    return this.mapChatToDto(chat);
  }

  @Get(":chatId/listings")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
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
    const result = await this.queryBus.execute(
      new GetChatListingsQuery(chatId, request.user.id),
    );

    const user = request.user;

    const listingsWithFavoriteStatus = await Promise.all(
      result.listings.map(async (listing) => {
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
      chat: {
        chatId: result.chat.chatId,
        chatName: result.chat.chatName,
        reasoningSummary: result.chat.reasoningSummary,
      },
      listings: listingsWithFavoriteStatus,
    };
  }

  @Post(":chatId/refine")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @RequireResourceOwnership({
    resourceType: ResourceType.CHAT,
    paramName: "chatId",
  })
  @ApiOperation({
    summary: "Start chat refinement with selected gift listings",
    description:
      "Continue the conversation with selected gift listings to refine search results",
  })
  @ApiOkResponse({
    description: "Refinement started successfully",
    type: StartChatRefinementResponseDto,
  })
  async startRefinement(
    @Param("chatId") chatId: string,
    @Body() dto: StartChatRefinementDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StartChatRefinementResponseDto> {
    // Validate DTO
    const validatedDto = startChatRefinementDtoSchema.parse(dto);

    // Verify all listings belong to this chat and are owned by the user
    for (const listingId of validatedDto.selectedListingIds) {
      const listing = await this.listingRepository.findById(listingId);
      if (listing === null) {
        throw new Error(`Listing ${listingId} not found`);
      }
      if (listing.chatId !== chatId) {
        throw new Error(
          `Listing ${listingId} does not belong to chat ${chatId}`,
        );
      }
      // Verify ownership through chat
      const isOwned = await this.listingRepository.isOwnedByUser(
        listingId,
        request.user.id,
      );
      if (!isOwned) {
        throw new Error(`User does not own listing ${listingId}`);
      }
    }

    // Execute command
    await this.commandBus.execute(
      new StartChatRefinementCommand(chatId, validatedDto.selectedListingIds),
    );

    return {
      message: "Refinement started successfully",
      chatId,
    };
  }
}
