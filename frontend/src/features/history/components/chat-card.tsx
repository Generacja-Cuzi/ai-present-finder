import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavButton } from "@/components/ui/nav-button";
import { $api } from "@/lib/api/client";

import { ReasoningDialog } from "./reasoning-dialog";

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
        <span className="text-sm text-gray-600">{giftCount}</span>
      </div>

      {reasoningSummary !== null && reasoningSummary !== undefined && (
        <Button
          onClick={() => {
            setShowSummary(true);
          }}
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
            to={`/chat/${chatId}`}
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

      <ReasoningDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        chatName={chatName}
        reasoningSummary={reasoningSummary}
      />
    </Card>
  );
}
