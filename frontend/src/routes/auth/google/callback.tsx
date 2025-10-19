import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

import { fetchClient } from "../../../lib/api/client";
import { oauthHandledAtom, userAtom } from "../../../lib/login/auth.store";

const store = getDefaultStore();

export const Route = createFileRoute("/auth/google/callback")({
  beforeLoad: async ({ search }) => {
    const code = (search as Record<string, string | undefined>)?.code;

    if (!code) {
      throw redirect({ to: "/", replace: true });
    }

    // Sprawdź czy callback został już obsłużony
    const handled = store.get(oauthHandledAtom);
    if (handled) {
      throw redirect({ to: "/stalking", replace: true });
    }

    try {
      // Wywołaj endpoint callback używając openapi-fetch
      const { data, error } = await fetchClient.POST("/auth/google/callback", {
        body: { code },
      });

      if (error || !data) {
        console.error("OAuth error:", error);
        store.set(oauthHandledAtom, false);
        throw redirect({ to: "/", replace: true });
      }

      // Zapisz użytkownika i oznacz jako obsłużone
      store.set(userAtom, data.user);
      store.set(oauthHandledAtom, true);
      throw redirect({ to: "/stalking", replace: true });
    } catch (error) {
      console.error("OAuth error:", error);
      store.set(oauthHandledAtom, false);
      throw redirect({ to: "/", replace: true });
    }
  },
  component: () => null,
});
