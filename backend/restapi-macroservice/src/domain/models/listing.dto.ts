import { ListingPayload } from "@core/types";

import { ApiProperty } from "@nestjs/swagger";

export class PriceDto {
  @ApiProperty({
    type: Number,
    description: "Price value",
    example: 10,
    nullable: true,
  })
  value: number | null;

  @ApiProperty({
    type: String,
    description: "Price label",
    example: "10",
    nullable: true,
  })
  label: string | null;

  @ApiProperty({
    type: String,
    description: "Currency",
    example: "USD",
    nullable: true,
  })
  currency: string | null;

  @ApiProperty({
    type: Boolean,
    description: "Whether price is negotiable",
    example: false,
    nullable: true,
  })
  negotiable: boolean | null;
}

export class BaseListingDto implements ListingPayload {
  @ApiProperty({
    type: String,
    description: "Image URL",
    example: "https://example.com/image.jpg",
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    type: String,
    description: "Title",
    example: "Book",
  })
  title: string;

  @ApiProperty({
    type: String,
    description: "Description",
    example: "Great book",
  })
  description: string;

  @ApiProperty({
    type: String,
    description: "Link",
    example: "https://example.com/book",
  })
  link: string;

  @ApiProperty({
    type: PriceDto,
    isArray: false,
    description: "Price",
    example: {
      value: 10,
      label: "10",
      currency: "USD",
      negotiable: false,
    },
  })
  price: PriceDto;

  @ApiProperty({
    type: String,
    description: "Category",
    example: "Elektronika",
    nullable: true,
    required: false,
  })
  category?: string | null;

  @ApiProperty({
    type: String,
    description: "Provider/shop name",
    example: "amazon",
    required: false,
  })
  provider?: string;
}

export class ListingWithIdDto extends BaseListingDto {
  @ApiProperty({
    type: String,
    description: "Listing ID from database",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  listingId: string;
}
