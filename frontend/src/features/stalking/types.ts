import { z } from "zod";

const instagramUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("instagram"), {
    message: "URL must be a valid Instagram URL",
  }),
]);
const xUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("x"), {
    message: "URL must be a valid X (formerly Twitter) URL",
  }),
]);
const tiktokUrlSchema = z.union([
  z.literal(""),
  z.url().refine((url) => url.includes("tiktok"), {
    message: "URL must be a valid TikTok URL",
  }),
]);

export const stalkingFormSchema = z.object({
  instagramUrl: instagramUrlSchema,
  xUrl: xUrlSchema,
  tiktokUrl: tiktokUrlSchema,
  occasion: z.enum(["birthday", "anniversary", "holiday", "just-because"], {
    message: "Please select an occasion",
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
