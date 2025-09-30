import { z } from "zod";

export const fetchOlxDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(40).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export type FetchOlxDto = z.infer<typeof fetchOlxDtoSchema>;
