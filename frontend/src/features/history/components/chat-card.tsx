import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavButton } from "@/components/ui/nav-button";
import { $api } from "@/lib/api/client";
import type { components } from "@/lib/api/types";

import { ReasoningDialog } from "./reasoning-dialog";

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
  reasoningSummary?:
    | {
        recipientProfile?: components["schemas"]["RecipientProfileDto"];
        keyThemesAndKeywords?: string[];
      }
    | undefined
    | null;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const formattedDate = new Date(createdAt).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="max-h-200 min-h-fit bg-white p-4 shadow-sm">
      <Button
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Usuń rozmowę"
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
            Znaleziono {giftCount} prezent{giftCount === 1 ? "" : "ów"}
          </p>
        ) : (
          <p className="text-sm text-gray-600">Nie znaleziono prezentów</p>
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
            label="Pokaż wyniki"
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
            Kontynuuj rozmowę
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
