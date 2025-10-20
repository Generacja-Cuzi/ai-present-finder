import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useSendMessage } from "../api/send-message";
import { useSseChat } from "../hooks/use-sse-chat";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { InappropriateRequestMessage } from "./inappropriate-request-message";

export function ChatUI({ clientId }: { clientId: string }) {
  const { state: chatState } = useSseChat({
    clientId,
  });
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");

  const isChatbotProcessing =
    sendMessage.isPending ||
    (chatState.type === "chatting" &&
      (chatState.data.messages.at(-1)?.sender === "user" ||
        chatState.data.messages.length === 0));

  useEffect(() => {
    if (chatState.type === "chat-interview-completed") {
      void navigate({
        to: "/gift-searching/$id",
        params: { id: clientId },
      });
    }
  }, [chatState.type, clientId, navigate]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatbotProcessing) {
      return;
    }

    setInputValue("");
    if (chatState.type !== "chatting") {
      throw new Error("Chat state is not chatting");
    }
    await sendMessage.mutateAsync({
      body: {
        messages: [
          ...chatState.data.messages,
          { id: uuidv4(), content: inputValue, sender: "user" },
        ],
        chatId: clientId,
      },
    });
  };

  if (chatState.type === "chat-inappropriate-request") {
    return <InappropriateRequestMessage reason={chatState.data.reason} />;
  }

  // At this point, chatState.type must be "chatting" or "chat-interview-completed"

  const messages = chatState.type === "chatting" ? chatState.data.messages : [];
  const currentStep = Math.min(messages.length, 10);

  return (
    <div className="flex h-screen flex-col pb-20">
      <ChatHeader currentStep={currentStep} />

      <ChatMessages messages={messages} isProcessing={isChatbotProcessing} />

      <div className="fixed bottom-20 left-0 right-0 bg-transparent">
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          isLoading={isChatbotProcessing}
        />
      </div>
    </div>
  );
}
