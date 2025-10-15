import { ListingPayload } from "@core/types";

import { ApiProperty } from "@nestjs/swagger";

class PriceDto {
  @ApiProperty({
    type: Number,
    description: "Price value",
    example: 10,
  })
  value: number | null;

  @ApiProperty({
    type: String,
    description: "Price label",
    example: "10",
  })
  label: string | null;

  @ApiProperty({
    type: String,
    description: "Currency",
    example: "USD",
  })
  currency: string | null;

  @ApiProperty({
    type: Boolean,
    description: "Whether price is negotiable",
    example: false,
  })
  negotiable: boolean | null;
}

export class ListingDto implements ListingPayload {
  @ApiProperty({
    type: String,
    description: "Image URL",
    example: "https://example.com/image.jpg",
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
}
