import z from 'zod';

export const FetchAllegroDto = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FetchAllegroDto = z.infer<typeof FetchAllegroDto>;
