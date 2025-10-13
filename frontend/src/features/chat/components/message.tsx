import type { ChatMessage } from "@core/types";

import { Avatar } from "@/components/ui/avatar";

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";

  return (
    <div
      key={message.id}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar
        alt={isUser ? "User" : "AI Present Finder"}
        className="mt-1 flex-shrink-0"
      />
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "text-foreground bg-[#F5F1E8]"
        }`}
      >
        <p className="text-base leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
