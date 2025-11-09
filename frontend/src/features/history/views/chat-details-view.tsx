/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable no-console */
import { InfoIcon } from "lucide-react";
import { useState } from "react";

import { FilterButton } from "@/components/filter-button";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { GiftCard } from "@/components/ui/gift-card";
import { NavButton } from "@/components/ui/nav-button";

import { useGetChatListingsQuery } from "../api/chats.api";
import { ReasoningDialog } from "../components/reasoning-dialog";

export function ChatDetailsView({ chatId }: { chatId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const { data, isLoading, isError } = useGetChatListingsQuery(chatId);

  const handleShopsFilter = () => {
    // TODO: Implement shops filter functionality
    console.log("Shops filter clicked");
  };

  const handlePriceRangeFilter = () => {
    // TODO: Implement price range filter functionality
    console.log("Price range filter clicked");
  };

  const handleCategoryFilter = () => {
    // TODO: Implement category filter functionality
    console.log("Category filter clicked");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <ChatDetailsHeader
          hasReasoning={false}
          onShowReasoning={() => {
            // Empty handler for loading state
          }}
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading gift recommendations...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <ChatDetailsHeader
          hasReasoning={false}
          onShowReasoning={() => {
            // Empty handler for error state
          }}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              Error loading results
            </p>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const listings = data?.listings ?? [];
  const chat = data?.chat;

  const reasoningSummary = chat?.reasoningSummary ?? null;

  const hasRecipientProfile = Boolean(reasoningSummary?.recipientProfile);

  const hasKeywords =
    reasoningSummary !== null &&
    Boolean(reasoningSummary.keyThemesAndKeywords) &&
    Array.isArray(reasoningSummary.keyThemesAndKeywords) &&
    reasoningSummary.keyThemesAndKeywords.length > 0;

  const hasReasoning = hasRecipientProfile || hasKeywords;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ChatDetailsHeader
        chatName={chat?.chatName}
        hasReasoning={hasReasoning}
        onShowReasoning={() => {
          setShowReasoningModal(true);
        }}
      />

      <main className="flex-1">
        <div className="space-y-4 bg-white p-4 pb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex gap-2 overflow-x-auto">
            <FilterButton label="Shops" onClick={handleShopsFilter} />
            <FilterButton
              label="Price Range"
              onClick={handlePriceRangeFilter}
            />
            <FilterButton label="Category" onClick={handleCategoryFilter} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {listings.map((listing) => (
            <GiftCard
              key={listing.id}
              gift={listing}
              provider="History"
              listingId={listing.id}
              initialIsFavorited={listing.isFavorited}
            />
          ))}
        </div>

        {listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No gifts found</p>
            <p className="mt-1 text-sm text-gray-500">
              This chat doesn&apos;t have any gift recommendations yet
            </p>
          </div>
        )}
      </main>

      <ReasoningDialog
        open={showReasoningModal}
        onOpenChange={setShowReasoningModal}
        chatName={chat?.chatName}
        reasoningSummary={reasoningSummary}
      />
    </div>
  );
}

function ChatDetailsHeader({
  chatName,
  hasReasoning,
  onShowReasoning,
}: {
  chatName?: string;
  hasReasoning: boolean;
  onShowReasoning: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <NavButton to="/history" />
          <h1 className="text-lg font-semibold">
            {chatName ?? "Gift Recommendations"}
          </h1>
        </div>
        {hasReasoning ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowReasoning}
            className="flex items-center gap-2"
          >
            <InfoIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Zobacz tok myślowy</span>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
