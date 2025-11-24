import { GiftSearching } from "../components/gift-search/gift-searching";
import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

/**
 * Wrapper component for the searching view that keeps the SSE connection alive
 * by using the useSseGiftSearching hook. This ensures the connection remains
 * open during the searching phase so we can receive the gift-ready event.
 */
export function SearchingView({ clientId }: { clientId: string }) {
  // Use the SSE hook to keep the connection alive, even though we're just showing
  // the searching UI. This prevents the connection from closing.
  useSseGiftSearching({ clientId });

  return <GiftSearching />;
}
