import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSendMessage } from "../api/send-message";
import { useSseChat } from "../hooks/use-sse-chat";
import { ChatInput } from "./chat-input";
import { Message } from "./message";
import { NonChatIndicator } from "./non-chat-indicator";
import { ThinkingBadge } from "./thinking-badge";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export function ChatUI({ clientId }: { clientId: string }) {
  const { state: chatState } = useSseChat({
    clientId,
  });
  const sendMessage = useSendMessage();

  const [inputValue, setInputValue] = useState("");

  const isChatbotProcessing =
    sendMessage.isPending ||
    chatState.type === "stalking-completed" ||
    (chatState.type === "chatting" &&
      chatState.data.messages.at(-1)?.sender === "user");

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatbotProcessing) {
      return;
    }

    setInputValue("");
    if (chatState.type !== "chatting") {
      throw new Error("Chat state is not chatting");
    }
    await sendMessage.mutateAsync({
      messages: [
        ...chatState.data.messages,
        { id: uuidv4(), content: inputValue, sender: "user" },
      ],
      chatId: clientId,
    });
  };

  if (
    chatState.type !== "chatting" &&
    chatState.type !== "stalking-completed"
  ) {
    return <NonChatIndicator state={chatState} />;
  }

  const messages = chatState.type === "chatting" ? chatState.data.messages : [];

  return (
    <Card className="mx-auto flex h-[90vh] w-full max-w-2xl flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isChatbotProcessing ? <ThinkingBadge /> : null}
          </div>
        </ScrollArea>
        <div className="flex-shrink-0">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            isLoading={isChatbotProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}
