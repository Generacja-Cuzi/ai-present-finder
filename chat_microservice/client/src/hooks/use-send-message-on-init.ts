import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";

export function useSendMessageOnInit(
  sendMessage: (message: UIMessage) => void
) {
  const hasSentInitialMessage = useRef(false);
  useEffect(() => {
    if (hasSentInitialMessage.current) return;
    hasSentInitialMessage.current = true;
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: "Hi there!" }],
      id: "DEFAULT_HIDE_THIS_MESSAGE",
    });
  }, [sendMessage]);
}
