const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = apiUrl ?? "http://localhost:3000";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export const authApi = {
  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await fetch(`${API_URL}/auth/google/url`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to get Google auth URL");
    }
    return response.json() as Promise<{ url: string }>;
  },

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with Google");
    }

    return response.json() as Promise<AuthResponse>;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json() as Promise<AuthResponse>;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to logout");
    }
  },
};
