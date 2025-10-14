import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { CustomSseProvider } from "@/lib/sse";

import {
  GiftIcon,
  SearchMessage,
  SearchProgress,
  SearchingLayout,
} from "../components";
import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

export function GiftSearchingView({ clientId }: { clientId: string }) {
  return (
    <CustomSseProvider clientId={clientId}>
      <GiftSearchingContent clientId={clientId} />
    </CustomSseProvider>
  );
}

function GiftSearchingContent({ clientId }: { clientId: string }) {
  const { state } = useSseGiftSearching({ clientId });
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const hasNavigatedRef = useRef(false);
  const progressRef = useRef(0);

  // Keep progress in sync with ref
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (state.type !== "searching") {
      return;
    }

    const startTime = Date.now();
    const maxDuration = 120_000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / maxDuration) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [state.type]);

  useEffect(() => {
    if (state.type !== "ready" || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    const giftIdeas = state.data.giftIdeas;
    const startProgress = progressRef.current;
    const remainingProgress = 100 - startProgress;
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      const newProgress = startProgress + remainingProgress * progressRatio;

      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress(100);
      }
    }, 50);

    const navigationTimer = setTimeout(() => {
      void navigate({
        to: "/recommendation/$id",
        params: { id: clientId },
      }).then(() => {
        window.history.replaceState({ ...window.history.state, giftIdeas }, "");
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(navigationTimer);
    };
  }, [state, clientId, navigate]);

  switch (state.type) {
    case "searching": {
      return (
        <SearchingLayout title="Finding the perfect gift">
          <div className="mb-16 flex justify-center">
            <GiftIcon />
          </div>

          <SearchProgress progress={progress} />

          <SearchMessage message="We're diving deep into their interests, hobbies, and past gifts to find something truly special." />
        </SearchingLayout>
      );
    }
    case "ready": {
      return (
        <SearchingLayout title="Perfect gifts found!">
          <div className="mb-16 flex justify-center">
            <GiftIcon />
          </div>

          <SearchProgress progress={progress} isComplete />

          <SearchMessage message="We're diving deep into their interests, hobbies, and past gifts to find something truly special." />
        </SearchingLayout>
      );
    }
  }
}
