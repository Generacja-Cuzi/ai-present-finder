import { useGetChatListingsQuery } from "@/features/history/api/chats.api";
import { RecommendationView } from "@/features/recommendation/views/recommendation-view";

import { GiftSearching } from "../components/gift-search/gift-searching";
import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

export function SearchRecommendationView({
  chatId,
  hasGifts,
  backTo,
}: {
  chatId: string;
  hasGifts: boolean;
  backTo?: string;
}) {
  const { state } = useSseGiftSearching({ clientId: chatId });
  const { data, isLoading, isError } = useGetChatListingsQuery(chatId);

  if (hasGifts) {
    if (isLoading) {
      return <div>Ładowanie ofert...</div>;
    }
    if (isError) {
      return <div>Błąd podczas ładowania ofert.</div>;
    }
    if (data !== undefined) {
      const listingsWithId = data.listings.map((listing) => ({
        ...listing,
        listingId: listing.id,
      }));
      return (
        <RecommendationView
          clientId={chatId}
          giftIdeas={listingsWithId}
          maxRound={data.maxRound}
          backTo={backTo}
        />
      );
    }
  }

  if (state.type === "searching") {
    return <GiftSearching />;
  }
  return (
    <RecommendationView
      clientId={chatId}
      giftIdeas={state.data.giftIdeas}
      backTo={backTo}
    />
  );
}
