import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useStalkingRequestMutation } from "../api/stalking-request";

export function StalkingView() {
  const navigate = useNavigate();
  const stalkingRequestMutation = useStalkingRequestMutation();

  const handleStart = async () => {
    try {
      // Generate a unique client ID for this session
      const clientId = uuidv7();

      // TODO(simon-the-shark): someone needs to add this later
      await stalkingRequestMutation.mutateAsync(
        {
          facebookUrl: "",
          instagramUrl: "",
          tiktokUrl: "",
          youtubeUrl: "",
          xUrl: "",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 dark:from-gray-900 dark:to-gray-800">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Social Media Stalking 🔍
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Add social media profiles to find the perfect gift
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="instagram-url"
              className="mb-2 block text-sm font-medium"
            >
              Instagram URL
            </label>
            <Input id="instagram-url" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label
              htmlFor="tiktok-url"
              className="mb-2 block text-sm font-medium"
            >
              TikTok URL
            </label>
            <Input id="tiktok-url" placeholder="https://tiktok.com/..." />
          </div>
          <div>
            <label htmlFor="x-url" className="mb-2 block text-sm font-medium">
              X (Twitter) URL
            </label>
            <Input id="x-url" placeholder="https://x.com/..." />
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={stalkingRequestMutation.isPending}
          >
            {stalkingRequestMutation.isPending
              ? "Starting..."
              : "Start Analysis →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
