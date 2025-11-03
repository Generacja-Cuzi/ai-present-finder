import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { components } from "@/lib/api/types";

type Feedback = components["schemas"]["FeedbackResponseDto"];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function FeedbackCard({ feedback }: { feedback: Feedback }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Feedback od użytkownika {feedback.userId.slice(0, 8)}...
          </CardTitle>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`star-${String(index)}`}
                className={`h-5 w-5 ${
                  index < feedback.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <CardDescription>
          Chat ID: {feedback.chatId} • {formatDate(feedback.createdAt)}
        </CardDescription>
      </CardHeader>
      {feedback.comment !== null && feedback.comment !== undefined && (
        <CardContent>
          <p className="text-muted-foreground text-sm italic">
            &ldquo;{feedback.comment ?? ""}&rdquo;
          </p>
        </CardContent>
      )}
    </Card>
  );
}
