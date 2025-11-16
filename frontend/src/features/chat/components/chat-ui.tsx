import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useSendMessage } from "../api/send-message";
import { useSseChat } from "../hooks/use-sse-chat";
import type { ChatState } from "../types";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { InappropriateRequestMessage } from "./inappropriate-request-message";
import { PotentialAnswers } from "./potential-answers";

export function ChatUI({
  clientId,
  initialState,
}: {
  clientId: string;
  initialState: ChatState;
}) {
  const { state: chatState } = useSseChat({
    clientId,
    initialState,
  });
  const sendMessage = useSendMessage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = useState("");

  const isChatbotProcessing =
    sendMessage.isPending ||
    (chatState.type === "chatting" &&
      (chatState.data.messages.at(-1)?.sender === "user" ||
        chatState.data.messages.length === 0));

  // When interview is completed, invalidate the chat query to refetch updated state
  useEffect(() => {
    if (chatState.type === "chat-interview-completed") {
      // Invalidate the chat query to refetch with updated isInterviewCompleted status
      void queryClient.invalidateQueries({
        queryKey: [
          "get",
          "/chats/{chatId}",
          { params: { path: { chatId: clientId } } },
        ],
      });

      // Navigate to trigger re-render with updated data
      void navigate({
        to: "/chat/$id",
        params: { id: clientId },
        replace: true,
      });
    }
  }, [chatState.type, clientId, navigate, queryClient]);

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

  const handleAnswerSelect = async (answer: string) => {
    if (isChatbotProcessing) {
      return;
    }

    if (chatState.type !== "chatting") {
      throw new Error("Chat state is not chatting");
    }
    await sendMessage.mutateAsync({
      body: {
        messages: [
          ...chatState.data.messages,
          { id: uuidv4(), content: answer, sender: "user" },
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
  const TOTAL_STEPS = 30;
  const currentStep = Math.min(
    messages.filter((message) => message.sender === "assistant").length,
    TOTAL_STEPS,
  );

  const potentialAnswers =
    chatState.type === "chatting" &&
    chatState.data.messages.at(-1)?.proposedAnswers != null
      ? (chatState.data.messages.at(-1)?.proposedAnswers?.answers ?? [])
      : [];

  return (
    <div className="flex h-screen flex-col pb-20">
      <ChatHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <ChatMessages messages={messages} isProcessing={isChatbotProcessing} />

      <div className="bg-transparent p-2">
        {potentialAnswers.length > 0 ? (
          <PotentialAnswers
            answers={potentialAnswers}
            onAnswerSelect={handleAnswerSelect}
          />
        ) : (
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            isLoading={isChatbotProcessing}
          />
        )}
      </div>
    </div>
  );
}
