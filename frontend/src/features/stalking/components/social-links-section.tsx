import { Controller, useFormContext } from "react-hook-form";

import { SocialMediaInput } from "../components";
import type { StalkingFormData } from "../types";

export function SocialLinksSection() {
  const { control } = useFormContext<StalkingFormData>();

  return (
    <section className="mb-8">
      <h2 className="text-foreground mb-2 text-2xl font-bold">
        Tell us about the person
      </h2>
      <p className="mb-6 text-base text-gray-500">
        Enter their social media profile URL. We support Instagram, X, and
        TikTok.
      </p>

      <div className="space-y-4">
        <Controller
          name="instagramUrl"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <SocialMediaInput
                platform="instagram"
                value={field.value}
                onChange={field.onChange}
                placeholder="Instagram URL"
              />
              {Boolean(fieldState.error) && (
                <p className="text-sm text-red-500">
                  {fieldState.error?.message ?? "Invalid URL"}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="xUrl"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <SocialMediaInput
                platform="x"
                value={field.value}
                onChange={field.onChange}
                placeholder="X (formerly Twitter) URL"
              />
              {Boolean(fieldState.error) && (
                <p className="text-sm text-red-500">
                  {fieldState.error?.message ?? "Invalid URL"}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="tiktokUrl"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <SocialMediaInput
                platform="tiktok"
                value={field.value}
                onChange={field.onChange}
                placeholder="TikTok URL"
              />
              {Boolean(fieldState.error) && (
                <p className="text-sm text-red-500">
                  {fieldState.error?.message ?? "Invalid URL"}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </section>
  );
}
