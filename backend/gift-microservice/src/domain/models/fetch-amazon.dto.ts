import { z } from "zod";

export const fetchAmazonDtoSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  country: z.string().default("PL").optional(),
  page: z.number().min(1).default(1).optional(),
});

export type FetchAmazonDto = z.infer<typeof fetchAmazonDtoSchema>;
