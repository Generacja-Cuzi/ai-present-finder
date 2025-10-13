import React from "react";

import { SseProvider } from "@/lib/sse";

export function SseProviderWrapper({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId: string;
}) {
  return <SseProvider clientId={clientId}>{children}</SseProvider>;
}
