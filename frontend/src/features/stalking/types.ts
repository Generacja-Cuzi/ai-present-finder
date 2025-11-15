import { z } from "zod";

const createSocialUrlSchema = (keyword: string, message: string) =>
  z.union([
    z.literal(""),
    z
      .url({ message })
      .refine((url) => url.toLowerCase().includes(keyword), { message }),
  ]);

const instagramUrlSchema = createSocialUrlSchema(
  "instagram",
  "Adres URL musi być prawidłowym adresem URL Instagram",
);

const xUrlSchema = createSocialUrlSchema(
  "x.com",
  "Adres URL musi być prawidłowym adresem URL X (wcześniej Twitter)",
);

const tiktokUrlSchema = createSocialUrlSchema(
  "tiktok",
  "Adres URL musi być prawidłowym adresem URL TikTok",
);

const optionalPriceSchema = z
  .union([z.number().positive("Cena musi być większa od zera"), z.nan()])
  .transform((value) => {
    if (Number.isNaN(value)) {
      return;
    }
    return value;
  })
  .optional();

export const stalkingFormSchema = z
  .object({
    instagramUrl: instagramUrlSchema,
    xUrl: xUrlSchema,
    tiktokUrl: tiktokUrlSchema,
    occasion: z.enum(["birthday", "anniversary", "holiday", "just-because"], {
      message: "Proszę wybrać okazję",
    }),
    minPrice: optionalPriceSchema,
    maxPrice: optionalPriceSchema,
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Cena minimalna musi być mniejsza lub równa cenie maksymalnej",
      path: ["maxPrice"],
    },
  );

export type StalkingFormData = z.infer<typeof stalkingFormSchema>;

export interface StalkingRequestData {
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  chatId: string;
}

export type StalkingRequestResponse = undefined;
