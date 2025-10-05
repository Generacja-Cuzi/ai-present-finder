import { z } from "zod";

import { ApiProperty } from "@nestjs/swagger";

import type { ListingDto } from "./listing.dto";
import { ListingDtoDocument, listingDtoSchema } from "./listing.dto";

export const giftReadyDtoSchema = z.object({
  giftIdeas: z.array(listingDtoSchema),
});

export type GiftReadyDto = z.infer<typeof giftReadyDtoSchema>;

export class GiftReadyDtoDocument implements GiftReadyDto {
  @ApiProperty({ type: ListingDtoDocument, isArray: true })
  giftIdeas: ListingDto[];
}
