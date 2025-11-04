import { useSseGiftSearching } from "@/features/gift-searching/hooks/use-sse-gift-searching";
import { useGetChatListingsQuery } from "@/features/history/api/chats.api";
import { RecommendationView } from "@/features/recommendation/views/recommendation-view";

export function SearchRecommendationView({
  chatId,
  hasGifts,
}: {
  chatId: string;
  hasGifts: boolean;
}) {
  const { state } = useSseGiftSearching({ clientId: chatId });
  const { data, isLoading, isError } = useGetChatListingsQuery(chatId);
  // If we already know there are gifts from the parent, fetch them
  if (hasGifts) {
    if (isLoading) {
      return <div>Loading listings...</div>;
    }
    if (isError) {
      return <div>Error loading listings.</div>;
    }
    if (data !== undefined) {
      const listingsWithId = data.listings.map((listing, index) => ({
        ...listing,
        listingId: listing.id || `listing-${String(index)}`,
      }));
      return (
        <RecommendationView clientId={chatId} giftIdeas={listingsWithId} />
      );
    }
  }

  // If no gifts yet, show searching state or wait for SSE event
  if (state.type === "searching") {
    return <div>Searching for the perfect gifts...</div>;
  }

  return (
    <RecommendationView clientId={chatId} giftIdeas={state.data.giftIdeas} />
  );
}
