import {
  Brain,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { $api } from "@/lib/api/client";
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

export function FeedbackCard({
  chatId,
  feedbacks,
}: {
  chatId: string;
  feedbacks: Feedback[];
}) {
  const [expanded, setExpanded] = useState(false);

  // Pobierz dane czatu aby uzyskać reasoning summary i listingi
  const { data: chatData } = $api.useQuery("get", "/chats/{chatId}", {
    params: { path: { chatId } },
  });

  const { data: listingsData } = $api.useQuery(
    "get",
    "/chats/{chatId}/listings",
    {
      params: { path: { chatId } },
    },
  );

  const generalFeedback = feedbacks.find((f) => f.isGeneralFeedback === true);
  const productFeedbacks = feedbacks.filter(
    (f) => f.isGeneralFeedback !== true,
  );

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : "0";

  const reasoningSummary = chatData?.reasoningSummary ?? null;
  const listings = listingsData?.listings ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer"
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              Chat: {chatId.slice(0, 12)}...
              <span className="text-sm font-normal text-gray-500">
                ({feedbacks.length}{" "}
                {feedbacks.length === 1 ? "opinia" : "opinii"})
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              Średnia ocena: {averageRating} / 5.0 •{" "}
              {feedbacks[0] !== null && feedbacks[0] !== undefined
                ? formatDate(feedbacks[0].createdAt)
                : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`star-${String(index)}`}
                  className={`h-5 w-5 ${
                    index < Math.round(Number(averageRating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && reasoningSummary !== null && (
        <CardContent className="space-y-6">
          {/* Thinking Process */}
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
              <Brain className="h-5 w-5" />
              Tok myślowy AI
            </div>
            <div className="space-y-2 text-sm">
              {reasoningSummary.recipientProfile !== null &&
                reasoningSummary.recipientProfile !== undefined && (
                  <div>
                    <p className="font-medium text-slate-600">
                      Profil odbiorcy:
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap rounded bg-white p-2 text-xs">
                      {JSON.stringify(
                        reasoningSummary.recipientProfile,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              {reasoningSummary.keyThemesAndKeywords !== null &&
                reasoningSummary.keyThemesAndKeywords !== undefined && (
                  <div>
                    <p className="font-medium text-slate-600">
                      Kluczowe tematy i słowa:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reasoningSummary.keyThemesAndKeywords.map(
                        (keyword, index) => (
                          <span
                            key={String(index)}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          >
                            {keyword}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* General Feedback */}
          {generalFeedback !== undefined && (
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-purple-700">
                <MessageSquare className="h-5 w-5" />
                Ogólna opinia
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`general-star-${String(index)}`}
                    className={`h-4 w-4 ${
                      index < generalFeedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {generalFeedback.comment &&
                generalFeedback.comment.trim() !== "" && (
                  <p className="mt-2 text-sm italic text-purple-900">
                    &ldquo;{generalFeedback.comment}&rdquo;
                  </p>
                )}
            </div>
          )}

          {/* Product Feedbacks */}
          {productFeedbacks.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">
                Opinie o produktach ({productFeedbacks.length})
              </h3>
              <div className="space-y-3">
                {productFeedbacks.map((feedback) => {
                  const listing = listings.find(
                    (l) => l.id === feedback.productId,
                  );
                  return (
                    <div
                      key={feedback.id}
                      className="group relative rounded-lg border bg-white p-3 transition-all hover:shadow-md"
                    >
                      <div className="flex gap-3">
                        {listing?.image !== null &&
                        listing?.image !== undefined &&
                        listing.image.trim() !== "" ? (
                          <img
                            src={listing.image}
                            alt={listing.title ?? "Product"}
                            className="h-16 w-16 rounded object-cover"
                          />
                        ) : null}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {listing?.title ??
                              `Produkt ${String(feedback.productId ?? "").slice(0, 8) || "nieznany"}...`}
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={`product-star-${feedback.id}-${String(index)}`}
                                className={`h-3 w-3 ${
                                  index < feedback.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs text-gray-500">
                              {feedback.rating}/5
                            </span>
                          </div>
                          {feedback.comment !== null &&
                            feedback.comment !== undefined &&
                            feedback.comment.trim() !== "" && (
                              <p className="mt-1 text-xs italic text-gray-600">
                                &ldquo;{feedback.comment}&rdquo;
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
