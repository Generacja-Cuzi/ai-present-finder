import { ApiProperty } from "@nestjs/swagger";

import { BaseListingDto } from "../../domain/models/listing.dto";

export class AddToFavoritesDto {
  @ApiProperty({
    description: "Listing ID to add to favorites",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  listingId: string;
}

export class RemoveFromFavoritesDto {
  @ApiProperty({
    description: "Listing ID to remove from favorites",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  listingId: string;
}

export class ListingResponseDto extends BaseListingDto {
  @ApiProperty({
    description: "Listing ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Chat ID this listing belongs to",
    example: "cm123abc",
    type: String,
    nullable: true,
  })
  chatId: string | null;

  @ApiProperty({
    description: "Whether this listing is favorited by the current user",
    example: true,
  })
  isFavorited: boolean;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2025-01-15T10:30:00Z",
  })
  createdAt: Date;
}

export class FavoritesResponseDto {
  @ApiProperty({
    description: "List of favorite listings",
    type: ListingResponseDto,
    isArray: true,
  })
  favorites: ListingResponseDto[];
}
