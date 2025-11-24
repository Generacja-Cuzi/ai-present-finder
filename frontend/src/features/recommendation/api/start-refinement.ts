import { $api } from "@/lib/api/client";

export function useStartChatRefinement() {
  return $api.useMutation("post", "/chats/{chatId}/refine");
}
