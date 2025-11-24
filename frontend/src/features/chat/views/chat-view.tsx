import { CustomSseProvider } from "@/lib/sse";

import { useGetChatQuery } from "../api/get-chat";
import { ChatShimmer } from "../components/chat-shimmer";
import { ChatUI } from "../components/chat-ui";
import { useInitialChatState } from "../hooks/use-initial-state";
import { SearchRecommendationView } from "./search-recommendation";
import { SearchingView } from "./searching-view";

export function ChatView({ clientId }: { clientId: string }) {
  const { initialState, isLoading } = useInitialChatState(clientId);
  const {
    data: chatInfo,
    isLoading: isLoadingChatInfo,
    isError: isChatInfoError,
  } = useGetChatQuery(clientId);

  // Always keep SSE provider mounted to prevent connection from closing
  // during query refetches (e.g., when status changes from interview to searching)
  return (
    <CustomSseProvider clientId={clientId}>
      {isLoading || isLoadingChatInfo ? (
        <ChatShimmer />
      ) : isChatInfoError ? (
        <div>
          Błąd podczas ładowania informacji o rozmowie. Spróbuj ponownie.
        </div>
      ) : chatInfo?.status === "completed" ? (
        <SearchRecommendationView
          chatId={clientId}
          hasGifts={chatInfo.giftCount > 0}
        />
      ) : chatInfo?.status === "searching" ? (
        <SearchingView clientId={clientId} />
      ) : (
        <ChatUI clientId={clientId} initialState={initialState} />
      )}
    </CustomSseProvider>
  );
}
