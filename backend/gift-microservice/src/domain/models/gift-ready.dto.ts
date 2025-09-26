import { z } from "zod";

import { listingDtoSchema } from "./listing.dto";

export const giftReadyDtoSchema = z.object({
  giftIdeas: z.array(listingDtoSchema),
});

<<<<<<< HEAD
export type GiftReadyDto = z.infer<typeof giftReadyDtoSchema>;
=======
export type GiftReadyDto = z.infer<typeof GiftReadyDto>;

import { ApiProperty } from '@nestjs/swagger';

export class GiftReadyDtoDoc implements GiftReadyDto {
  @ApiProperty({ type: () => [ListingDto] })
  giftIdeas: ListingDto[];
}
>>>>>>> b8c32b6 (docs(backend): add swager + openapi)
