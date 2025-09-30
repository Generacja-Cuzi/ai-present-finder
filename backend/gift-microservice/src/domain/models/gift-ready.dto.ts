import z from "zod";

import { ListingDto } from "./listing.dto";

export const GiftReadyDto = z.object({
  giftIdeas: z.array(ListingDto),
});

export type GiftReadyDto = z.infer<typeof GiftReadyDto>;
