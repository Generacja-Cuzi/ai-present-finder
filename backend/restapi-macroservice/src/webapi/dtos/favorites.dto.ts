import { ApiProperty } from "@nestjs/swagger";

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

export class ListingResponseDto {
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
    description: "Image URL",
    example: "https://example.com/image.jpg",
    type: String,
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    description: "Product title",
    example: "Wireless Headphones",
  })
  title: string;

  @ApiProperty({
    description: "Product description",
    example: "High-quality wireless headphones with noise cancellation",
  })
  description: string;

  @ApiProperty({
    description: "Product link",
    example: "https://example.com/product/123",
  })
  link: string;

  @ApiProperty({
    description: "Price value",
    example: 99.99,
    type: Number,
    nullable: true,
  })
  priceValue: number | null;

  @ApiProperty({
    description: "Price label",
    example: "$99.99",
    type: String,
    nullable: true,
  })
  priceLabel: string | null;

  @ApiProperty({
    description: "Price currency",
    example: "USD",
    type: String,
    nullable: true,
  })
  priceCurrency: string | null;

  @ApiProperty({
    description: "Whether price is negotiable",
    example: false,
  })
  priceNegotiable: boolean;

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
