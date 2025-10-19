import { createFileRoute, redirect } from "@tanstack/react-router";

import { authApi } from "../../../features/login/api/auth.api";
import { useAuthStore } from "../../../features/login/store/auth.store";

export const Route = createFileRoute("/auth/google/callback")({
  beforeLoad: ({ search }) => {
    const { setAuth } = useAuthStore.getState();
    const code = (search as Record<string, string | undefined>)?.code;

    if (!code) {
      throw redirect({ to: "/", replace: true });
    }

    if (sessionStorage.getItem("oauth:google:handled") === "1") {
      throw redirect({ to: "/stalking", replace: true });
    }

    return authApi
      .handleGoogleCallback(code)
      .then((authResponse) => {
        setAuth(authResponse.user);
        sessionStorage.setItem("oauth:google:handled", "1");
        throw redirect({ to: "/stalking", replace: true });
      })
      .catch((error) => {
        console.error("OAuth error:", error);
        sessionStorage.removeItem("oauth:google:handled");
        throw redirect({ to: "/", replace: true });
      });
  },
  component: () => null,
});
