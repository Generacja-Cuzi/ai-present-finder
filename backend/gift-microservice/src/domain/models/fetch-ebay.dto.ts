import z from 'zod';

export const FetchEbayDto = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export type FetchEbayDto = z.infer<typeof FetchEbayDto>;
