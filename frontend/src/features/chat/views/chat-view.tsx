import { CustomSseProvider } from "@/lib/sse";

import { useGetChatQuery } from "../api/get-chat";
import { ChatShimmer } from "../components/chat-shimmer";
import { ChatUI } from "../components/chat-ui";
import { GiftSearching } from "../components/gift-search/gift-searching";
import { useInitialChatState } from "../hooks/use-initial-state";
import { SearchRecommendationView } from "./search-recommendation";

export function ChatView({ clientId }: { clientId: string }) {
  const { initialState, isLoading } = useInitialChatState(clientId);
  const {
    data: chatInfo,
    isLoading: isLoadingChatInfo,
    isError: isChatInfoError,
  } = useGetChatQuery(clientId);

  if (isLoading || isLoadingChatInfo) {
    return <ChatShimmer />;
  }

  if (isChatInfoError) {
    return (
      <div>Błąd podczas ładowania informacji o rozmowie. Spróbuj ponownie.</div>
    );
  }

  return (
    <CustomSseProvider clientId={clientId}>
      {chatInfo?.status === "completed" ? (
        <SearchRecommendationView
          chatId={clientId}
          hasGifts={chatInfo.giftCount > 0}
        />
      ) : chatInfo?.status === "searching" ? (
        <GiftSearching />
      ) : (
        <ChatUI clientId={clientId} initialState={initialState} />
      )}
    </CustomSseProvider>
  );
}
