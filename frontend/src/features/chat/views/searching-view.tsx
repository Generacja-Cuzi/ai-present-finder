import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { GiftSearching } from "../components/gift-search/gift-searching";
import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

/**
 * Wrapper component for the searching view that keeps the SSE connection alive
 * by using the useSseGiftSearching hook. This ensures the connection remains
 * open during the searching phase so we can receive the gift-ready event.
 */
export function SearchingView({ clientId }: { clientId: string }) {
  // Use the SSE hook to keep the connection alive and track progress
  const { state } = useSseGiftSearching({ clientId });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const hasStalkingCompleted =
    state.type === "searching" && state.hasStalkingCompleted;

  const progress =
    state.type === "searching" && state.progress
      ? state.progress.percentage
      : 0;

  const message =
    state.type === "searching" && state.progress
      ? state.progress.message
      : hasStalkingCompleted
        ? "Generuję pomysły na prezenty..."
        : "Przeszukuję internet...";

  // When gifts are ready, invalidate and refetch to trigger navigation
  useEffect(() => {
    if (state.type === "ready") {
      // Force refetch to update the UI immediately
      void queryClient.invalidateQueries({
        queryKey: [
          "get",
          "/chats/{chatId}",
          {
            params: {
              path: {
                chatId: clientId,
              },
            },
          },
        ],
      });

      // Small delay to ensure query has updated before navigation
      const timer = setTimeout(() => {
        navigate(`/chat/${clientId}`, { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [state.type, queryClient, clientId, navigate]);

  return <GiftSearching progress={progress} message={message} />;
}
