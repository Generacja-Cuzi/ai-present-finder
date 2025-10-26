import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

import { fetchClient } from "../../../lib/api/client";
import { oauthHandledAtom, userAtom } from "../../../lib/login/auth.store";

const store = getDefaultStore();

export const Route = createFileRoute("/auth/google/callback")({
  beforeLoad: async ({ search }) => {
    const code = (search as Record<string, string | undefined | null> | null)
      ?.code;

    if (code === undefined || code === "" || code === null) {
      return redirect({ to: "/", replace: true });
    }

    const handled = store.get(oauthHandledAtom);
    if (handled) {
      store.set(oauthHandledAtom, false);
      return redirect({ to: "/stalking", replace: true });
    }

    try {
      const { data, error } = await fetchClient.POST("/auth/google/callback", {
        body: { code },
      });

      if (data === undefined) {
        console.error("OAuth error:", error);
        store.set(oauthHandledAtom, false);
        return redirect({ to: "/", replace: true });
      }

      store.set(userAtom, data.user);
      store.set(oauthHandledAtom, true);

      await new Promise((resolve) => setTimeout(resolve, 50));

      return redirect({ to: "/stalking", replace: true });
    } catch (error) {
      console.error("OAuth error:", error);
      store.set(oauthHandledAtom, false);
      return redirect({ to: "/", replace: true });
    }
  },
  component: () => null,
});
