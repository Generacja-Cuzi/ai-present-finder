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

export const stalkingFormSchema = z.object({
  instagramUrl: instagramUrlSchema,
  xUrl: xUrlSchema,
  tiktokUrl: tiktokUrlSchema,
  occasion: z.enum(["birthday", "anniversary", "holiday", "just-because"], {
    message: "Proszę wybrać okazję",
  }),
});

export type StalkingFormData = z.infer<typeof stalkingFormSchema>;

export interface StalkingRequestData {
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  chatId: string;
}

export type StalkingRequestResponse = undefined;
