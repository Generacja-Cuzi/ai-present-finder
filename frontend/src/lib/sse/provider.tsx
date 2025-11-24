import React, { useMemo } from "react";
import { SSEProvider } from "react-hooks-sse";

import { getBackendUrl } from "@/lib/backend-url";

export function CustomSseProvider({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId: string;
}) {
  const baseUrl = getBackendUrl();
  const sseEndpoint = useMemo(
    () => `${baseUrl}/sse?clientId=${clientId}`,
    [baseUrl, clientId],
  );

  return <SSEProvider endpoint={sseEndpoint}>{children}</SSEProvider>;
}
