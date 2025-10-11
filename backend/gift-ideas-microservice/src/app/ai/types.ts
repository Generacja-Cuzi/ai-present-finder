import { z } from "zod";

export const giftIdeasOutputSchema = z.object({
  gift_ideas: z.array(z.string()).min(3).max(8),
  search_queries: z
    .array(
      z.object({
        query: z.string(),
        service: z.enum(["allegro", "olx", "ebay", "amazon"]),
      }),
    )
    .min(6)
    .max(30),
});

export type GiftIdeasOutput = z.infer<typeof giftIdeasOutputSchema>;
