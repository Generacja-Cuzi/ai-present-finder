import { z } from "zod";

const instagramUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("instagram"), {
    message: "Adres URL musi być prawidłowym adresem URL Instagram",
  }),
]);
const xUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("x"), {
    message: "Adres URL musi być prawidłowym adresem URL X (wcześniej Twitter)",
  }),
]);
const tiktokUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("tiktok"), {
    message: "Adres URL musi być prawidłowym adresem URL TikTok",
  }),
]);

const optionalPriceSchema = z
  .number()
  .positive()
  .optional()
  .or(
    z.nan().transform((value) => {
      if (Number.isNaN(value)) {
        return;
      }
      return value;
    }),
  );

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
