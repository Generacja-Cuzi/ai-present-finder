import z from 'zod';

export const ListingDto = z.object({
  image: z.string().url().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url(),
  price: z.object({
    value: z.number().nullable(),
    label: z.string().nullable(),
    currency: z.string().nullable(),
    negotiable: z.boolean().nullable(),
  }),
});

export type ListingDto = z.infer<typeof ListingDto>;

