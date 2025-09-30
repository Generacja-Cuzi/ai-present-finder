import { openai } from "@ai-sdk/openai";
import type {
  ModelMessage,
  UIDataTypes,
  UIMessage} from "ai";
import {
  generateText,
  stepCountIs,
} from "ai";

import { giftConsultantPrompt } from "./prompt";
import type { MyUITools} from "./tools";
import { getTools } from "./tools";
import type { EndConversationOutput } from "./types";

export async function giftInterviewFlow({
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
