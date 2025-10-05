import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

export const listingDtoSchema = z.object({
  image: z.url().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.url(),
  price: z.object({
    value: z.number().nullable(),
    label: z.string().nullable(),
    currency: z.string().nullable(),
    negotiable: z.boolean().nullable(),
  }),
});

export type ListingDto = z.infer<typeof listingDtoSchema>;

export class ListingDtoDocument implements ListingDto {
  @ApiProperty({
    type: String,
    description: "Image URL",
    example: "https://example.com/image.jpg",
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    type: String,
    description: "Listing title",
    example: "Lego Star Wars Set",
  })
  title: string;

  @ApiProperty({
    type: String,
    description: "Detailed description",
    example: "Great condition, used once",
  })
  description: string;

  @ApiProperty({
    type: String,
    description: "Link to listing",
    example: "https://olx.pl/...",
  })
  link: string;

  @ApiProperty({ description: "Price details", type: () => Object })
  price: {
    value: number | null;
    label: string | null;
    currency: string | null;
    negotiable: boolean | null;
  };
}
