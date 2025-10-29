import { z } from "zod";

export const giftIdeasOutputSchema = z.object({
  gift_ideas: z.array(z.string()).min(6).max(8),
  search_queries: z
    .array(
      z.object({
        query: z
          .string()
          .refine((q) => q.split(" ").length <= 5, "Query must be max 5 words"),
        service: z.enum(["allegro", "olx", "ebay", "amazon"]),
      }),
    )
    .length(24) // Dokładnie 24 zapytania (6 per service)
    .refine((queries) => {
      const counts = queries.reduce<Record<string, number>>(
        (accumulator, q) => {
          accumulator[q.service] = (accumulator[q.service] || 0) + 1;
          return accumulator;
        },
        {},
      );
      return (
        counts.allegro === 6 &&
        counts.olx === 6 &&
        counts.ebay === 6 &&
        counts.amazon === 6
      );
    }, "Must have exactly 6 queries per service (allegro, olx, ebay, amazon)"),
});

export type GiftIdeasOutput = z.infer<typeof giftIdeasOutputSchema>;
