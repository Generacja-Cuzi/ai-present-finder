import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/types";

import { useGetAllFeedbacks } from "../api/feedbacks";
import { FeedbackCard } from "../components/feedback-card";

type Feedback = components["schemas"]["FeedbackResponseDto"];

export function FeedbacksView() {
  const { data, isLoading } = useGetAllFeedbacks();
  const navigate = useNavigate();

  // Grupuj feedbacki według chatId
  const feedbacksByChat = useMemo(() => {
    if (isLoading || data === undefined) {
      return new Map();
    }
    const grouped = new Map<string, Feedback[]>();
    for (const feedback of data) {
      const chatFeedbacks = grouped.get(feedback.chatId) ?? [];
      chatFeedbacks.push(feedback);
      grouped.set(feedback.chatId, chatFeedbacks);
    }
    return grouped;
  }, [data, isLoading]);

  if (isLoading || data === undefined) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center">
        <div className="text-lg">Ładowanie feedbacków...</div>
      </div>
    );
  }

  const feedbacks: Feedback[] = data;

  const totalFeedbacks = feedbacks.length;
  const totalChats = feedbacksByChat.size;
  const averageRating =
    totalFeedbacks > 0
      ? (
          feedbacks.reduce((sum: number, f: Feedback) => sum + f.rating, 0) /
          totalFeedbacks
        ).toFixed(1)
      : "0";

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              void navigate({ to: "/profile" });
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do profilu
          </Button>
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Panel Feedbacków
          </h1>
          <div className="text-muted-foreground flex gap-6 text-sm">
            <div>
              Łącznie feedbacków:{" "}
              <span className="font-semibold">{totalFeedbacks}</span>
            </div>
            <div>
              Sesji z feedbackami:{" "}
              <span className="font-semibold">{totalChats}</span>
            </div>
            <div>
              Średnia ocena:{" "}
              <span className="font-semibold">{averageRating} / 5.0</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[...feedbacksByChat.entries()].map(([chatId, chatFeedbacks]) => (
            <FeedbackCard
              key={chatId}
              chatId={chatId}
              feedbacks={chatFeedbacks}
            />
          ))}
          {feedbacksByChat.size === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              <p className="text-lg">Brak feedbacków do wyświetlenia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
