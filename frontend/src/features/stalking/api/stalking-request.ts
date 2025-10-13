import { useMutation } from "@tanstack/react-query";

import { getBackendUrl } from "@/lib/backend-url";

interface StalkingRequestData {
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  chatId: string;
}

async function createStalkingRequest(data: StalkingRequestData): Promise<void> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/restapi/stalking-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create stalking request: ${response.statusText}`,
    );
  }
}

export function useStalkingRequestMutation() {
  return useMutation({
    mutationFn: createStalkingRequest,
  });
}
