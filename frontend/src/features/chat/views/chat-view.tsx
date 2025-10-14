import { CustomSseProvider } from "@/lib/sse";

import { ChatUI } from "../components/chat-ui";

export function ChatView({ clientId }: { clientId: string }) {
  return (
    <CustomSseProvider clientId={clientId}>
      <ChatUI clientId={clientId} />
    </CustomSseProvider>
  );
}
