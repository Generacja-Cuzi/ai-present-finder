import { ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavButton } from "@/components/ui/nav-button";

export function ChatCard({
  chatId,
  chatName,
  createdAt,
  giftCount = 0,
}: {
  chatId: string;
  chatName: string;
  createdAt: Date;
  giftCount?: number;
}) {
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
          <p className="mb-3 text-sm text-gray-600">
            Found {giftCount} gift{giftCount === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mb-3 text-sm text-gray-600">No gifts found</p>
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
      <div>
        <NavButton
          to={`/history/chat/${chatId}`}
          className="bg-primary mt-4 w-full text-white hover:bg-amber-600"
          label="View Results"
          icon={<ArrowRight className="h-5 w-5" />}
        />
      </div>
    </Card>
  );
}
