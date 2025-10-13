import { Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";

import { useStalkingRequestMutation } from "../api/stalking-request";
import type { Occasion } from "../components";
import { OccasionCard, SocialMediaInput } from "../components";

export function StalkingView() {
  const navigate = useNavigate();
  const { mutateAsync: sendRequest, isPending } = useStalkingRequestMutation();

  const [instagramUrl, setInstagramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null,
  );

  const handleStart = async () => {
    try {
      const clientId = uuidv7();

      await sendRequest(
        {
          facebookUrl: "",
          instagramUrl,
          tiktokUrl,
          youtubeUrl: "",
          xUrl,
          linkedinUrl: "",
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

  const isFormValid = selectedOccasion !== null;

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

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        <section className="mb-8">
          <h2 className="text-foreground mb-2 text-2xl font-bold">
            Tell us about the person
          </h2>
          <p className="mb-6 text-base text-gray-500">
            Enter their social media profile URL. We support Instagram, X, and
            TikTok.
          </p>

          <div className="space-y-4">
            <SocialMediaInput
              platform="instagram"
              value={instagramUrl}
              onChange={setInstagramUrl}
              placeholder="Instagram URL"
            />
            <SocialMediaInput
              platform="x"
              value={xUrl}
              onChange={setXUrl}
              placeholder="X (formerly Twitter) URL"
            />
            <SocialMediaInput
              platform="tiktok"
              value={tiktokUrl}
              onChange={setTiktokUrl}
              placeholder="TikTok URL"
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
                setSelectedOccasion("birthday");
              }}
            />
            <OccasionCard
              occasion="anniversary"
              selected={selectedOccasion === "anniversary"}
              onSelect={() => {
                setSelectedOccasion("anniversary");
              }}
            />
            <OccasionCard
              occasion="holiday"
              selected={selectedOccasion === "holiday"}
              onSelect={() => {
                setSelectedOccasion("holiday");
              }}
            />
            <OccasionCard
              occasion="just-because"
              selected={selectedOccasion === "just-because"}
              onSelect={() => {
                setSelectedOccasion("just-because");
              }}
            />
          </div>
        </section>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-transparent px-6 py-4 shadow-none">
        <Button
          onClick={handleStart}
          disabled={!isFormValid || isPending}
          className="bg-brand text-brand-foreground hover:bg-brand/90 w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isPending ? "Starting..." : "Find Gift Ideas"}
        </Button>
      </div>
    </div>
  );
}
