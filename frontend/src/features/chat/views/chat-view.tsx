import { CustomSseProvider } from "@/lib/sse";

import { ChatShimmer } from "../components/chat-shimmer";
import { ChatUI } from "../components/chat-ui";
import { useInitialChatState } from "../hooks/use-initial-state";

export function ChatView({ clientId }: { clientId: string }) {
  const { initialState, isLoading } = useInitialChatState(clientId);
  if (isLoading) {
    return <ChatShimmer />;
  }
  return (
    <CustomSseProvider clientId={clientId}>
      <ChatUI clientId={clientId} initialState={initialState} />
    </CustomSseProvider>
  );
}
