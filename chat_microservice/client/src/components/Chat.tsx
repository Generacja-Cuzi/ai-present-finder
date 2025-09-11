import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useState } from "react";
import { useSendMessageOnInit } from "../hooks/use-send-message-on-init";

export default function Chat() {
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `http://localhost:3000/api/chat`,
      credentials: "include",
    }),
    generateId: () => crypto.randomUUID(),
    messages: [],
    // id: chatId, // This will reset the chat when chatId changes
  });

  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
      setInput("");
    },
    [sendMessage, input]
  );

  useSendMessageOnInit(sendMessage);

  const isThinking = status === "streaming" || status === "submitted";
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map(
          (message) =>
            message.id !== "DEFAULT_HIDE_THIS_MESSAGE" && (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white ml-12"
                    : "bg-gray-200 text-gray-800 mr-12"
                }`}
              >
                <div className="font-semibold text-sm mb-1">
                  {message.role === "user" ? "You" : "AI"}
                </div>
                <div>
                  {message.parts.map((part) => {
                    if (part.type === "text") {
                      return part.text;
                    }
                    return null;
                  })}
                </div>
              </div>
            )
        )}

        {isThinking && (
          <div className="bg-gray-200 text-gray-800 mr-12 p-3 rounded-lg">
            <div className="font-semibold text-sm mb-1">AI</div>
            <div>Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isThinking}
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
