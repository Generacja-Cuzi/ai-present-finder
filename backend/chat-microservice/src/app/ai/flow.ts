import { openai } from "@ai-sdk/openai";
import {
  ModelMessage,
  UIDataTypes,
  UIMessage,
  generateText,
  stepCountIs,
} from "ai";

import { giftConsultantPrompt } from "./prompt";
import { MyUITools, getTools } from "./tools";
import { EndConversationOutput } from "./types";

export function giftInterviewFlow({
  messages,
  closeInterview,
  flagInappropriateRequest,
}: {
  messages: ModelMessage[];
  closeInterview: (output: EndConversationOutput) => void;
  flagInappropriateRequest: (reason: string) => void;
}) {
  return generateText({
    model: openai("gpt-5-nano"),
    messages,
    system: giftConsultantPrompt,
    stopWhen: stepCountIs(5),
    tools: getTools(closeInterview, flagInappropriateRequest),
  });
}

export type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;
