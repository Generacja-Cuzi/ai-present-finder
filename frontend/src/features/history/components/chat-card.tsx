import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NavButton } from "@/components/ui/nav-button";
import { $api } from "@/lib/api/client";

interface ReasoningSummary {
  recipientProfile?: {
    personal_info?: {
      person_name?: string | null;
      relationship?: string | null;
      occasion?: string | null;
      age_range?: string | null;
    };
    lifestyle?: {
      primary_hobbies?: string[] | null;
      daily_routine?: string | null;
      relaxation_methods?: string[] | null;
      work_style?: string | null;
    };
    preferences?: {
      home_aesthetic?: string | null;
      valued_items?: string[] | null;
      favorite_beverages?: string[] | null;
      comfort_foods?: string[] | null;
    };
    media_interests?: {
      favorite_books?: string[] | null;
      must_watch_shows?: string[] | null;
      podcasts?: string[] | null;
      music_preferences?: string[] | null;
    };
    recent_life?: {
      new_experiences?: string[] | null;
      mentioned_needs?: string[] | null;
      recent_achievements?: string[] | null;
    };
    gift_context?: {
      occasion_significance?: string | null;
      gift_message?: string | null;
      previous_gift_successes?: string[] | null;
    };
  };
  keyThemesAndKeywords?: string[];
}

export function ChatCard({
  chatId,
  chatName,
  createdAt,
  giftCount,
  isInterviewCompleted,
  reasoningSummary,
}: {
  chatId: string;
  chatName: string;
  createdAt: Date;
  giftCount: number;
  isInterviewCompleted: boolean;
  reasoningSummary?: ReasoningSummary | null;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="max-h-200 min-h-fit bg-white p-4 shadow-sm">
      <Button
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Delete chat"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="mb-3">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{chatName}</h2>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </div>

      <div>
        {giftCount > 0 ? (
          <p className="text-sm text-gray-600">
            Found {giftCount} gift{giftCount === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="text-sm text-gray-600">No gifts found</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="text-gray-400">📷</span>
          <span className="text-gray-400">🛍️</span>
          <span className="text-gray-400">💬</span>
        </div>
        <span className="text-sm text-gray-600">{giftCount || 0}</span>
      </div>

      {reasoningSummary && (
        <Button
          onClick={() => setShowSummary(true)}
          variant="outline"
          className="mt-3 w-full text-sm"
        >
          <Eye className="mr-2 h-4 w-4" />
          Zobacz tok myślowy
        </Button>
      )}

      <div>
        {isInterviewCompleted ? (
          <NavButton
            to={`/history/chat/${chatId}`}
            className="bg-primary mt-4 w-full text-white hover:bg-amber-600"
            label="View Results"
            icon={<ArrowRight className="h-5 w-5" />}
          />
        ) : (
          <Button
            onClick={async () => {
              await queryClient.refetchQueries(
                $api.queryOptions("get", "/messages/chat/{chatId}", {
                  params: {
                    path: {
                      chatId,
                    },
                  },
                }),
              );
              void navigate({ to: `/chat/${chatId}` });
            }}
            className="bg-primary mt-4 w-full text-white hover:bg-amber-600"
          >
            Continue Chat
            <MessageCircle className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tok myślowy - {chatName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reasoningSummary?.keyThemesAndKeywords &&
              reasoningSummary.keyThemesAndKeywords.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Kluczowe tematy i słowa kluczowe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {reasoningSummary.keyThemesAndKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {reasoningSummary?.recipientProfile && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Profil odbiorcy</h3>

                {reasoningSummary.recipientProfile.personal_info && (
                  <InfoSection
                    title="Informacje osobiste"
                    data={reasoningSummary.recipientProfile.personal_info}
                  />
                )}

                {reasoningSummary.recipientProfile.lifestyle && (
                  <InfoSection
                    title="Styl życia"
                    data={reasoningSummary.recipientProfile.lifestyle}
                  />
                )}

                {reasoningSummary.recipientProfile.preferences && (
                  <InfoSection
                    title="Preferencje"
                    data={reasoningSummary.recipientProfile.preferences}
                  />
                )}

                {reasoningSummary.recipientProfile.media_interests && (
                  <InfoSection
                    title="Zainteresowania medialne"
                    data={reasoningSummary.recipientProfile.media_interests}
                  />
                )}

                {reasoningSummary.recipientProfile.recent_life && (
                  <InfoSection
                    title="Ostatnie wydarzenia"
                    data={reasoningSummary.recipientProfile.recent_life}
                  />
                )}

                {reasoningSummary.recipientProfile.gift_context && (
                  <InfoSection
                    title="Kontekst prezentu"
                    data={reasoningSummary.recipientProfile.gift_context}
                  />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function InfoSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true),
  );

  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <h4 className="mb-2 text-sm font-medium text-gray-700">{title}</h4>
      <dl className="space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <dt className="inline font-medium text-gray-600">
              {formatLabel(key)}:{" "}
            </dt>
            <dd className="inline text-gray-900">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}
