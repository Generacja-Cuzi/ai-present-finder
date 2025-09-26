<<<<<<< HEAD
import { z } from "zod";
=======
import z from 'zod';
import { ApiProperty } from '@nestjs/swagger';
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)

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

<<<<<<< HEAD
export type ListingDto = z.infer<typeof listingDtoSchema>;
=======
export type ListingDto = z.infer<typeof ListingDto>;

export class ListingDtoDoc implements ListingDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ description: 'Listing title', example: 'Lego Star Wars Set' })
  title: string;

  @ApiProperty({
    description: 'Detailed description',
    example: 'Great condition, used once',
  })
  description: string;

  @ApiProperty({
    description: 'Link to listing',
    example: 'https://olx.pl/...',
  })
  link: string;

  @ApiProperty({ description: 'Price details', type: () => Object })
  price: {
    value: number | null;
    label: string | null;
    currency: string | null;
    negotiable: boolean | null;
  };
}
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
