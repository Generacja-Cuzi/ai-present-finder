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

import { useStalkingRequestMutation } from "../api/stalking-request";

export function HomeView() {
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
    } catch (error) {
      console.error("Failed to start:", error);
      toast.error("Failed to start gift search. Please try again.", {
        id: "stalking-request",
        dismissible: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Hello! 👋
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Welcome to AI Present Finder
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Let&apos;s help you find the perfect gift for your loved ones!
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={stalkingRequestMutation.isPending}
          >
            {stalkingRequestMutation.isPending ? "Starting..." : "Start →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
