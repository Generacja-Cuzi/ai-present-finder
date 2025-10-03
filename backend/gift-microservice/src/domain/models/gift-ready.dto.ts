import { z } from "zod";

import type { ListingDto } from "./listing.dto";
import { listingDtoSchema } from "./listing.dto";

export const giftReadyDtoSchema = z.object({
  giftIdeas: z.array(listingDtoSchema),
});

export type GiftReadyDto = z.infer<typeof giftReadyDtoSchema>;

import { ApiProperty } from '@nestjs/swagger';

export class GiftReadyDtoDoc implements GiftReadyDto {
  @ApiProperty({ type: Object, isArray: true })
  giftIdeas: ListingDto[];
}
