import { $api } from "@/lib/api/client";

export function useGetChatsQuery() {
  return $api.useQuery("get", "/chats");
}

export function useGetChatListingsQuery(chatId: string) {
  return $api.useQuery("get", "/chats/{chatId}/listings", {
    params: {
      path: {
        chatId,
      },
    },
  });
}
