import z from "zod";

export const GiftGenerateRequestedDto = z.object({
  keywords: z.array(z.string().min(1).max(100)),
});

export type GiftGenerateRequestedDto = z.infer<typeof GiftGenerateRequestedDto>;
