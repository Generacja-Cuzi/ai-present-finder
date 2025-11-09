import { $api } from "@/lib/api/client";

export function useGetFeedbackByChatId(chatId: string) {
  return $api.useQuery(
    "get",
    "/feedback/chat/{chatId}",
    {
      params: {
        path: {
          chatId,
        },
      },
    },
    { retry: false },
  );
}

export function useCreateFeedback() {
  return $api.useMutation("post", "/feedback");
}
