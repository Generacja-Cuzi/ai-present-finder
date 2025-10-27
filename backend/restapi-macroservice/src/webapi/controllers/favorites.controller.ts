import { AddToFavoritesCommand } from "src/domain/commands/add-to-favorites.command";
import { RemoveFromFavoritesCommand } from "src/domain/commands/remove-from-favorites.command";
import type { User } from "src/domain/entities/user.entity";
import { GetUserFavoritesQuery } from "src/domain/queries/get-user-favorites.query";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import {
  AddToFavoritesDto,
  FavoritesResponseDto,
  ListingResponseDto,
} from "src/webapi/dtos/favorites.dto";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";

@ApiTags("favorites")
@ApiBearerAuth()
@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly listingRepository: IListingRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all favorite listings for the current user" })
  @ApiOkResponse({
    description: "List of favorite listings",
    type: FavoritesResponseDto,
  })
  async getFavorites(
    @Request() request: { user: User },
  ): Promise<FavoritesResponseDto> {
    const user = request.user;
    const listings = await this.queryBus.execute(
      new GetUserFavoritesQuery(user.id),
    );

    const favorites: ListingResponseDto[] = listings.map((listing) => ({
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
      isFavorited: true,
      createdAt: listing.createdAt,
    }));

    return { favorites };
  }

  @Post()
  @ApiOperation({ summary: "Add a listing to favorites" })
  @ApiOkResponse({ description: "Listing added to favorites" })
  async addToFavorites(
    @Request() request: { user: User },
    @Body() dto: AddToFavoritesDto,
  ): Promise<void> {
    const user = request.user;
    await this.commandBus.execute(
      new AddToFavoritesCommand(user.id, dto.listingId),
    );
  }

  @Delete(":listingId")
  @ApiOperation({ summary: "Remove a listing from favorites" })
  @ApiOkResponse({ description: "Listing removed from favorites" })
  async removeFromFavorites(
    @Request() request: { user: User },
    @Param("listingId") listingId: string,
  ): Promise<void> {
    const user = request.user;
    await this.commandBus.execute(
      new RemoveFromFavoritesCommand(user.id, listingId),
    );
  }
}
