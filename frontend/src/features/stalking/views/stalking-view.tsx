import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";
import type { paths } from "@/lib/api/types";

import { useStalkingRequestMutation } from "../api/stalking-request";
import {
  OccasionSelector,
  PriceRangeSection,
  SocialLinksSection,
  StalkingHeader,
  SubmitBar,
} from "../components";
import { ProfileSelectionDialog } from "../components/profile-selection";
import { useStalkingForm } from "../hooks/use-stalking-form";
import type { StalkingFormData } from "../types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function StalkingView() {
  const navigate = useNavigate();
  const { mutateAsync: sendRequest, isPending } = useStalkingRequestMutation();
  const [showProfileQuestion, setShowProfileQuestion] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null,
  );

  const methods = useStalkingForm();
  const { formState } = methods;

  const handleUseProfile = () => {
    setShowProfileQuestion(false);
    setShowProfileDialog(true);
  };

  const handleSkipProfile = () => {
    setShowProfileQuestion(false);
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const onSubmit: SubmitHandler<StalkingFormData> = async (data) => {
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
            profileId: selectedProfile?.id,
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
          },
        },
        {
          onSuccess: () => {
            void navigate({ to: "/chat/$id", params: { id: clientId } });
          },
        },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
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

      {showProfileQuestion ? (
        <div className="bg-card mx-6 my-4 rounded-lg border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">
            Czy chcesz wczytać profil osoby?
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Jeśli wcześniej szukałeś już prezentu dla tej osoby, możesz wczytać
            jej profil, aby przyspieszyć proces.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleUseProfile} variant="default">
              Tak, wczytaj profil
            </Button>
            <Button onClick={handleSkipProfile} variant="outline">
              Nie, pomiń
            </Button>
          </div>
        </div>
      ) : null}

      {selectedProfile === null ? null : (
        <div className="border-primary/20 bg-primary/5 mx-6 mb-4 rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium">
              Wybrany profil: {selectedProfile.personName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProfile(null);
              }}
            >
              Usuń
            </Button>
          </div>
          {selectedProfile.profile.personal_info?.relationship !==
            undefined && (
            <p className="text-muted-foreground text-sm">
              Relacja: {selectedProfile.profile.personal_info.relationship}
            </p>
          )}
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={(event) => {
            void methods.handleSubmit(onSubmit)(event);
          }}
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          <SocialLinksSection />
          <OccasionSelector />
          <PriceRangeSection />
          <SubmitBar
            disabled={!formState.isValid || isPending}
            isPending={isPending}
          />
        </form>
      </FormProvider>

      <ProfileSelectionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onSelectProfile={handleProfileSelect}
      />
    </div>
  );
}
