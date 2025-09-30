import React from "react";
import { SSEProvider } from "react-hooks-sse";

import { getBackendUrl } from "@/lib/backend-url";

export function SseProviderWrapper({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId: string;
}) {
  const baseUrl = getBackendUrl();
  const sseEndpoint = `${baseUrl}/sse?clientId=${clientId}`;
  return <SSEProvider endpoint={sseEndpoint}>{children}</SSEProvider>;
}
