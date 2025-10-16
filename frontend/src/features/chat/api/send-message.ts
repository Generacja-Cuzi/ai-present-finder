import { $api } from "@/lib/api/client";

export function useSendMessage() {
  return $api.useMutation("post", "/restapi/send-message");
}
