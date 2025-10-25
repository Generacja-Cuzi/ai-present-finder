import { useGetChatMessagesQuery } from "../api/get-chat-messages";
import type { ChatState } from "../types";

export function useInitialChatState(chatId: string) {
  // Fetch chat messages history
  const { data: messagesData, isLoading } = useGetChatMessagesQuery(chatId);

  const initialState: ChatState = {
    type: "chatting",
    data: {
      messages:
        messagesData?.messages.map((message) => ({
          id: message.id,
          content: message.content,
          sender: message.role === "user" ? "user" : "assistant",
          proposedAnswers: message.proposedAnswers ?? undefined,
        })) ?? [],
    },
  };

  return { initialState, isLoading };
}
