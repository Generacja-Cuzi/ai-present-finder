import { useNavigate } from "@tanstack/react-router";
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
  const stalkingRequestMutation = useStalkingRequestMutation();

  const [instagramUrl, setInstagramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null,
  );

  const handleBack = () => {
    void navigate({ to: "/" });
  };

  const handleStart = async () => {
    try {
      // Generate a unique client ID for this session
      const clientId = uuidv7();

      await stalkingRequestMutation.mutateAsync(
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
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] pb-20">
      {/* Header */}
      <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-4">
        <button
          onClick={handleBack}
          className="absolute left-4 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="size-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Find the perfect gift
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        {/* Social Media Section */}
        <section className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
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

        {/* Gift Parameters Section */}
        <section className="mb-8">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
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

      {/* Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 bg-transparent px-6 py-4 shadow-none">
        <Button
          onClick={handleStart}
          disabled={!isFormValid || stalkingRequestMutation.isPending}
          className="w-full rounded-full bg-[#E89B3C] py-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#D88A2B] active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {stalkingRequestMutation.isPending
            ? "Starting..."
            : "Find Gift Ideas"}
        </Button>
      </div>
    </div>
  );
}
