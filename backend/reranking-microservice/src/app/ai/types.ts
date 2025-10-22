import type { ListingPayload } from "@core/types";
import { z } from "zod";

const priceSchema = z.object({
  value: z.number().nullable(),
  label: z.string().nullable(),
  currency: z.string().nullable(),
  negotiable: z.boolean().nullable(),
});

const listingDtoSchema = z.object({
  image: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  link: z.string(),
  price: priceSchema,
});

export const productRankingSchema = listingDtoSchema.extend({
  score: z.number().min(1).max(10),
  reasoning: z.string(),
});

export const rankedProductsOutputSchema = z.object({
  rankings: z.array(productRankingSchema),
});

export type ProductRanking = z.infer<typeof productRankingSchema>;
export type RankedProductsOutput = z.infer<typeof rankedProductsOutputSchema>;

export interface ProductWithScore extends ListingPayload {
  score: number;
  reasoning: string;
}
