import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { MyUIMessage } from "../../../server/src/ai/flow";
import ChatMessage from "./ChatMessage";
import { Bot, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
export default function Chat() {
  const { messages, status, sendMessage } = useChat<MyUIMessage>({
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

  const isThinking = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-[90vh] max-w-4xl mx-auto">
      <ScrollArea className="flex-1 p-4 pb-20 min-h-0">
        <h1>AI Gift Consultant</h1>
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {messages.map(
            (message) =>
              message.id !== "DEFAULT_HIDE_THIS_MESSAGE" && (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <Card
                    className={cn(
                      "max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <CardContent className="p-4">
                      <ChatMessage message={message} />
                    </CardContent>
                  </Card>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
          )}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4" />
                    <span className="text-sm font-medium">AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container p-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              placeholder="Type your message..."
              disabled={isThinking}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isThinking || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
