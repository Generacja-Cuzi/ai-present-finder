import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";

import { isAuthenticatedAtom, userAtom } from "@/lib/login/auth.store";
import type { User } from "@/lib/login/auth.store";

import { fetchClient } from "../../lib/api/client";
import { AuthContext } from "./auth-context";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (user !== null) {
        try {
          const response = await fetchClient.GET("/auth/me");
          if (response.response.ok && response.data !== undefined) {
            const userData = response.data;
            setUser({
              id: userData.id,
              email: userData.email,
              givenName: userData.givenName,
              familyName: userData.familyName,
              picture: userData.picture,
              role: userData.role,
            });
          } else {
            console.warn("Session validation failed, clearing user");
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to validate session:", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    void validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- user is intentionally excluded to avoid infinite validation loop
  }, [setUser]);

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
    isLoading,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
