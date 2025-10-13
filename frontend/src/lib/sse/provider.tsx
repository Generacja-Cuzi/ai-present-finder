import React from "react";
import { SSEProvider } from "react-hooks-sse";

import { getBackendUrl } from "@/lib/backend-url";

interface SseProviderProps {
  children: React.ReactNode;
  clientId: string;
}

export function SseProvider({ children, clientId }: SseProviderProps) {
  const baseUrl = getBackendUrl();
  const sseEndpoint = `${baseUrl}/sse?clientId=${clientId}`;

  return <SSEProvider endpoint={sseEndpoint}>{children}</SSEProvider>;
}
