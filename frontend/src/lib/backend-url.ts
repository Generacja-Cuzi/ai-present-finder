import { z } from "zod";

// Extend Window interface to include runtime config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      apiUrl: string;
    };
  }
}

export function getBackendUrl() {
  // Priority: Runtime config > Build-time env var > Default
  const runtimeUrl: string | undefined = window.__RUNTIME_CONFIG__?.apiUrl;
  const buildTimeUrl: string | undefined = import.meta.env.VITE_BACKEND_URL as
    | string
    | undefined;
  const url: string = runtimeUrl ?? buildTimeUrl ?? "http://localhost:3000";

  return z.string().trim().parse(url);
}
