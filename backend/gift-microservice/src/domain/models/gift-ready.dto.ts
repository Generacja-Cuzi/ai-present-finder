import { z } from "zod";

import { listingDtoSchema } from "./listing.dto";

export const giftReadyDtoSchema = z.object({
  giftIdeas: z.array(listingDtoSchema),
});

export type GiftReadyDto = z.infer<typeof giftReadyDtoSchema>;
