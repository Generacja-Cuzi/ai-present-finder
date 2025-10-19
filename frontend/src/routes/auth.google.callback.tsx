import { createFileRoute, redirect } from "@tanstack/react-router";

import { authApi } from "../../../features/login/api/auth.api";
import { useAuthStore } from "../../../features/login/store/auth.store";

export const Route = createFileRoute("/auth/google/callback")({
  beforeLoad: async ({ search }) => {
    const { setAuth } = useAuthStore.getState();
    const code = (search as Record<string, string | undefined>)?.code;

    if (!code) {
      throw redirect({ to: "/", replace: true });
    }

    if (sessionStorage.getItem("oauth:google:handled") === "1") {
      throw redirect({ to: "/stalking", replace: true });
    }

    try {
      const authResponse = await authApi.handleGoogleCallback(code);
      setAuth(authResponse.user);
      sessionStorage.setItem("oauth:google:handled", "1");
      throw redirect({ to: "/stalking", replace: true });
    } catch (e) {
      console.error("OAuth error:", e);
      sessionStorage.removeItem("oauth:google:handled");
      throw redirect({ to: "/", replace: true });
    }
  },
  component: () => null,
});
