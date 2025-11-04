import { z } from "zod";

export const productScoreSchema = z.object({
  id: z.string(),
  score: z.number().min(1).max(10),
  category: z.string().nullish(),

  reasoning: z.string(),
});

export const productScoresOutputSchema = z.object({
  scores: z.array(productScoreSchema),
});

export type ProductScore = z.infer<typeof productScoreSchema>;
export type ProductScoresOutput = z.infer<typeof productScoresOutputSchema>;
