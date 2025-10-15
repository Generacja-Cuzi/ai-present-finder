import { useNavigate } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";

import { useStalkingRequestMutation } from "../api/stalking-request";
import {
  OccasionSelector,
  SocialLinksSection,
  StalkingHeader,
  SubmitBar,
} from "../components";
import { useStalkingForm } from "../hooks/use-stalking-form";
import type { StalkingFormData } from "../types";

export function StalkingView() {
  const navigate = useNavigate();
  const { mutateAsync: sendRequest, isPending } = useStalkingRequestMutation();

  const methods = useStalkingForm();
  const { handleSubmit, formState } = methods;

  const onSubmit = async (data: StalkingFormData) => {
    try {
      const clientId = uuidv7();

      await sendRequest(
        {
          body: {
            instagramUrl: data.instagramUrl,
            tiktokUrl: data.tiktokUrl,
            xUrl: data.xUrl,
            chatId: clientId,
            occasion: data.occasion,
          },
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
      <StalkingHeader />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 pb-28"
        >
          <SocialLinksSection />
          <OccasionSelector />
          <SubmitBar
            disabled={!formState.isValid || isPending}
            isPending={isPending}
          />
        </form>
      </FormProvider>
    </div>
  );
}
