import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";

import { useStalkingRequestMutation } from "../api/stalking-request";

export function HomeView() {
  const navigate = useNavigate();
  const stalkingRequestMutation = useStalkingRequestMutation();

  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const handleStart = async () => {
    try {
      // Generate a unique client ID for this session
      const clientId = uuidv7();

      await stalkingRequestMutation.mutateAsync(
        {
          facebookUrl,
          instagramUrl,
          tiktokUrl,
          youtubeUrl,
          xUrl,
          linkedinUrl,
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
        <CardContent>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Let&apos;s help you find the perfect gift for your loved ones!
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/..."
                value={facebookUrl}
                onChange={(event) => {
                  setFacebookUrl(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/..."
                value={instagramUrl}
                onChange={(event) => {
                  setInstagramUrl(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok URL</Label>
              <Input
                id="tiktok"
                type="url"
                placeholder="https://tiktok.com/@..."
                value={tiktokUrl}
                onChange={(event) => {
                  setTiktokUrl(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input
                id="youtube"
                type="url"
                placeholder="https://youtube.com/@..."
                value={youtubeUrl}
                onChange={(event) => {
                  setYoutubeUrl(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="x">X (Twitter) URL</Label>
              <Input
                id="x"
                type="url"
                placeholder="https://x.com/..."
                value={xUrl}
                onChange={(event) => {
                  setXUrl(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(event) => {
                  setLinkedinUrl(event.target.value);
                }}
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleStart}
              disabled={stalkingRequestMutation.isPending}
            >
              {stalkingRequestMutation.isPending ? "Starting..." : "Start →"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
