import { Button } from "@/components/ui/button";

import { fetchClient } from "../../../lib/api/client";

const handleLogin = async () => {
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
};

export function HomeView() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="mb-8 w-full max-w-sm">
          <div className="bg-secondary aspect-square w-full overflow-hidden rounded-3xl shadow-lg">
            <img
              src="/aipf_logo_bgless.png"
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
