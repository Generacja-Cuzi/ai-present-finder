import { useAtom, useSetAtom } from "jotai";
import React from "react";

import { isAuthenticatedAtom, userAtom } from "@/lib/login/auth.store";
import type { User } from "@/lib/login/auth.store";

import { fetchClient } from "../../lib/api/client";
import { AuthContext } from "./auth-context";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

async function handleLogin() {
  try {
    const { data, error } = await fetchClient.GET("/auth/google/url");

    if (data === undefined) {
      console.error("Failed to get Google auth URL:", error);
      return;
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Failed to get Google auth URL:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const setUser = useSetAtom(userAtom);

  const logout = async () => {
    try {
      await fetchClient.POST("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const authState: AuthState = {
    isAuthenticated,
    user,
    login: handleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
