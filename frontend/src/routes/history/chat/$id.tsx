import { createFileRoute } from "@tanstack/react-router";

import { ChatDetailsView } from "@/features/history/views/chat-details-view";

export const Route = createFileRoute("/history/chat/$id")({
  component: ChatDetailsPage,
});

function ChatDetailsPage() {
  const { id } = Route.useParams();
  return <ChatDetailsView chatId={id} />;
}
