import type { ChatMessage } from "@core/types";

import { cn } from "@/lib/utils";

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";

  return (
    <div
      key={message.id}
      className={cn(
        "animate-in fade-in flex gap-3 duration-300",
        isUser
          ? "slide-in-from-right-2 flex-row-reverse"
          : "slide-in-from-left-2 flex-row",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-5 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        <p className="text-base leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
