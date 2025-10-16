import { useMutation } from "@tanstack/react-query";

import { getBackendUrl } from "@/lib/backend-url";

import type { SendMessageDto } from "../../../../../backend/restapi-macroservice/src/domain/models/send-message.dto";

export async function sendMessage(data: SendMessageDto) {
  return fetch(`${getBackendUrl()}/restapi/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important: send cookies for authentication
    body: JSON.stringify(data),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
  });
}
