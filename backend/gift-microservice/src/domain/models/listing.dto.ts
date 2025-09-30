import { z } from "zod";

export const listingDtoSchema = z.object({
  image: z.url().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.url(),
  price: z.object({
    value: z.number().nullable(),
    label: z.string().nullable(),
    currency: z.string().nullable(),
    negotiable: z.boolean().nullable(),
  }),
});

export type ListingDto = z.infer<typeof listingDtoSchema>;
