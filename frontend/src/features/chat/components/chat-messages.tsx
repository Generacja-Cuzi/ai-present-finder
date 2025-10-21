import type { ChatMessage as ChatMessageType } from "@core/types";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useAutoScroll } from "../hooks/use-auto-scroll";
import { Message } from "./message";
import { ThinkingBadge } from "./thinking-badge";

export function ChatMessages({
  messages,
  isProcessing = false,
}: {
  messages: ChatMessageType[];
  isProcessing?: boolean;
}) {
  const scrollAreaRef = useAutoScroll<HTMLDivElement>(messages, isProcessing);

  return (
    <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-6 p-4 pb-6">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isProcessing ? <ThinkingBadge /> : null}
      </div>
    </ScrollArea>
  );
}
