import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import { authApi } from "../../login/api/auth.api";
import { useAuthStore } from "../../login/store/auth.store";

const handleGoogleCallback = async (code: string) => {
  try {
    const authResponse = await authApi.handleGoogleCallback(code);
    return authResponse;
  } catch (error) {
    console.error("Failed to authenticate:", error);
    throw error;
  }
};

const handleLogin = async () => {
  try {
    const { url } = await authApi.getGoogleAuthUrl();
    window.location.href = url;
  } catch (error) {
    console.error("Failed to get Google auth URL:", error);
  }
};

export function HomeView() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const code = parameters.get("code");

    if (code !== null) {
      void handleGoogleCallback(code).then((authResponse) => {
        setAuth(authResponse.user);
        window.history.replaceState({}, document.title, "/");
        void navigate({ to: "/stalking" });
      });
    }
  }, [setAuth, navigate]);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="mb-8 w-full max-w-sm">
          <div className="bg-secondary aspect-square w-full overflow-hidden rounded-3xl shadow-lg">
            <img
              src="/logo192.png"
              alt="Gift box"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-foreground mb-4 text-center text-4xl font-bold">
          Find the perfect gift
        </h1>

        <p className="text-muted-foreground mb-8 text-center text-lg">
          Answer a few questions and we&apos;ll suggest personalized gifts your
          loved ones will adore.
        </p>

        <Button
          onClick={handleLogin}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full max-w-sm rounded-full py-7 text-lg font-semibold shadow-lg transition-all active:scale-95"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
