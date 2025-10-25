import { $api } from "@/lib/api/client";

export function useGetChatMessagesQuery(chatId: string) {
  return $api.useQuery("get", "/messages/chat/{chatId}", {
    params: {
      path: {
        chatId,
      },
    },
  });
}
