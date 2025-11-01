import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/types";

import { useGetAllFeedbacks } from "../api/feedbacks";
import { FeedbackCard } from "../components/feedback-card";

type Feedback = components["schemas"]["FeedbackResponseDto"];

export function FeedbacksView() {
  const { data, isLoading } = useGetAllFeedbacks();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center">
        <div className="text-lg">Ładowanie feedbacków...</div>
      </div>
    );
  }

  const feedbacks: Feedback[] = data;

  const totalFeedbacks = feedbacks.length;
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
              Łącznie: <span className="font-semibold">{totalFeedbacks}</span>
            </div>
            <div>
              Średnia ocena:{" "}
              <span className="font-semibold">{averageRating} / 5.0</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback: Feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p className="text-lg">Brak feedbacków do wyświetlenia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
