import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";

import { useStalkingRequestMutation } from "../api/stalking-request";
import { OccasionCard, SocialMediaInput } from "../components";
import { stalkingFormSchema } from "../types";
import type { StalkingFormData } from "../types";

export function StalkingView() {
  const navigate = useNavigate();
  const { mutateAsync: sendRequest, isPending } = useStalkingRequestMutation();

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<StalkingFormData>({
    resolver: zodResolver(stalkingFormSchema),
    mode: "onChange",
    defaultValues: {
      instagramUrl: "",
      xUrl: "",
      tiktokUrl: "",
    },
  });

  const selectedOccasion = watch("occasion");

  const onSubmit = async (data: StalkingFormData) => {
    try {
      const clientId = uuidv7();

      await sendRequest(
        {
          instagramUrl: data.instagramUrl,
          tiktokUrl: data.tiktokUrl,
          xUrl: data.xUrl,
          chatId: clientId,
        },
        {
          onSuccess: () => {
            void navigate({ to: "/chat/$id", params: { id: clientId } });
          },
        },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to start:", error);
      toast.error(`Failed to start gift search. ${message}`, {
        id: "stalking-request",
        dismissible: true,
      });
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col pb-20">
      <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-4">
        <Button
          asChild
          className="bg-background absolute left-4 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <RouterLink to="/">
            <ArrowLeft className="text-foreground size-6" />
          </RouterLink>
        </Button>
        <h1 className="text-foreground text-xl font-bold">
          Find the perfect gift
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto px-6 py-6 pb-28"
      >
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

        <section className="mb-8">
          <h2 className="text-foreground mb-2 text-xl font-bold">
            Gift Parameters
          </h2>
          <p className="mb-4 text-base text-gray-500">
            What&apos;s the occasion?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <OccasionCard
              occasion="birthday"
              selected={selectedOccasion === "birthday"}
              onSelect={() => {
                setValue("occasion", "birthday", {
                  shouldValidate: true,
                });
              }}
            />
            <OccasionCard
              occasion="anniversary"
              selected={selectedOccasion === "anniversary"}
              onSelect={() => {
                setValue("occasion", "anniversary", {
                  shouldValidate: true,
                });
              }}
            />
            <OccasionCard
              occasion="holiday"
              selected={selectedOccasion === "holiday"}
              onSelect={() => {
                setValue("occasion", "holiday", {
                  shouldValidate: true,
                });
              }}
            />
            <OccasionCard
              occasion="just-because"
              selected={selectedOccasion === "just-because"}
              onSelect={() => {
                setValue("occasion", "just-because", {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          {Boolean(errors.occasion) && (
            <p className="mt-2 text-sm text-red-500">
              {errors.occasion?.message ?? "Please select an occasion"}
            </p>
          )}
        </section>

        <div className="fixed bottom-20 left-0 right-0 bg-transparent px-6 py-4 shadow-none">
          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="bg-brand text-brand-foreground hover:bg-brand/90 w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isPending ? "Starting..." : "Find Gift Ideas"}
          </Button>
        </div>
      </form>
    </div>
  );
}
