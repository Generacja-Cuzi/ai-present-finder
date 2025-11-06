import { useGetChatListingsQuery } from "@/features/history/api/chats.api";
import { RecommendationView } from "@/features/recommendation/views/recommendation-view";

import { GiftSearching } from "../components/gift-search/gift-searching";
import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

export function SearchRecommendationView({
  chatId,
  hasGifts,
}: {
  chatId: string;
  hasGifts: boolean;
}) {
  const { state } = useSseGiftSearching({ clientId: chatId });
  const { data, isLoading, isError } = useGetChatListingsQuery(chatId);

  if (hasGifts) {
    if (isLoading) {
      return <div>Loading listings...</div>;
    }
    if (isError) {
      return <div>Error loading listings.</div>;
    }
    if (data !== undefined) {
      const listingsWithId = data.listings.map((listing) => ({
        ...listing,
        listingId: listing.id,
      }));
      return (
        <RecommendationView clientId={chatId} giftIdeas={listingsWithId} />
      );
    }
  }

  if (state.type === "searching") {
    return <GiftSearching />;
  }

  return (
    <RecommendationView clientId={chatId} giftIdeas={state.data.giftIdeas} />
  );
}
