import type { ChatMessage as ChatMessageType } from "@core/types";
import { useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement>(
  chatMessages: ChatMessageType[],
  isProcessing: boolean,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current !== null) {
      const scrollContainer = ref.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer !== null) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatMessages, isProcessing]);

  return ref;
}
