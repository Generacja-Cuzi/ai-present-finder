import { $api } from "@/lib/api/client";

export function useGetChatQuery(chatId: string) {
  return $api.useQuery("get", "/chats/{chatId}", {
    params: {
      path: {
        chatId,
      },
    },
  });
}
