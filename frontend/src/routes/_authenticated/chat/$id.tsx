import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ChatView } from "../../../features/chat/views/chat-view";

const searchSchema = z.object({
  from: z.enum(["history"]).optional(),
});

export const Route = createFileRoute("/_authenticated/chat/$id")({
  validateSearch: searchSchema,
  component: ChatPage,
});

function ChatPage() {
  const { id: clientId } = Route.useParams();
  const { from } = Route.useSearch();
  const backTo = from === "history" ? "/history" : "/start-search";
  return <ChatView clientId={clientId} backTo={backTo} />;
}
