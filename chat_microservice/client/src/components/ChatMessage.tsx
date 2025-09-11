import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import type { MyUIMessage } from "../../../server/src/ai/flow";
import type { JSX } from "react";

export default function ChatMessage({
  message,
}: {
  message: MyUIMessage;
}): JSX.Element {
  return (
    <>
      {message.parts.map((part, index: number) => {
        if (part.type === "text") {
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part.text}
            </div>
          );
        }

        if (
          part.type === "tool-end_conversation" ||
          part.type === "tool-flag_inappropriate_request" ||
          part.type === "tool-proceed_to_next_phase"
        ) {
          const toolCall = part;
          return (
            <div key={index} className="mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Wrench className="h-4 w-4" />
                <span>Tool Call: {toolCall.toolCallId}</span>
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    ID: {toolCall.toolCallId}
                  </div>
                  <div className="text-sm">
                    <strong>Arguments:</strong>
                    <pre className="mt-1 text-xs bg-background p-2 rounded border overflow-x-auto">
                      {JSON.stringify(toolCall.input, null, 2)}
                    </pre>
                    <strong>Output:</strong>
                    <pre className="mt-1 text-xs bg-background p-2 rounded border overflow-x-auto">
                      {JSON.stringify(toolCall.output, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
