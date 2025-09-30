import { createFileRoute } from "@tanstack/react-router";

import { ChatView } from "../../features/chat/views/chat-view";

export const Route = createFileRoute("/chat/$id")({
  component: ChatPage,
});

function ChatPage() {
  const { id: clientId } = Route.useParams();
  return <ChatView clientId={clientId} />;
}
