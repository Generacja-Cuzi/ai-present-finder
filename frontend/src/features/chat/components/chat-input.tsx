import { ArrowRight, Loader2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInput({
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading = false,
}: {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isLoading?: boolean;
}) {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-transparent px-4 py-3">
      <div className="flex items-end gap-3">
        <Avatar alt="User" className="mb-2 size-12 flex-shrink-0" />
        <div className="relative flex-1">
          <Textarea
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
            onKeyDown={handleKeyPress}
            placeholder="Wpisz tutaj jej zainteresowania..."
            className={cn(
              "w-full rounded-3xl border-2 border-gray-200 px-6 py-4 pr-16 text-base leading-relaxed",
              "bg-background text-foreground",
              "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:outline-none focus-visible:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "max-h-[400px] min-h-[164px]",
            )}
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className={cn(
              "absolute bottom-3 right-3 size-12 rounded-full shadow-md",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:shadow-none",
            )}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ArrowRight className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
