import { CustomSseProvider } from "@/lib/sse";

import { ChatUI } from "../components/chat-ui";

export function ChatView({ clientId }: { clientId: string }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          AI Present Finder - Chat
        </h1>
        <CustomSseProvider clientId={clientId}>
          <ChatUI clientId={clientId} />
        </CustomSseProvider>
      </div>
    </div>
  );
}
