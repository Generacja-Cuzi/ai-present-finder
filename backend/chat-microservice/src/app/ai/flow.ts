import { google } from "@ai-sdk/google";
import type { ModelMessage, UIDataTypes, UIMessage } from "ai";
import { generateText, stepCountIs } from "ai";

import { giftConsultantPrompt } from "./prompt";
import type { MyUITools } from "./tools";
import { getTools } from "./tools";
import type { EndConversationOutput, PotencialAnswers } from "./types";

export async function giftInterviewFlow({
  occasion,
  messages,
  closeInterview,
  flagInappropriateRequest,
  askAQuestionWithAnswerSuggestions,
}: {
  occasion: string;
  messages: ModelMessage[];
  closeInterview: (output: EndConversationOutput) => void;
  flagInappropriateRequest: (reason: string) => void;
  askAQuestionWithAnswerSuggestions: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void;
}) {
  return generateText({
    model: google("gemini-2.5-flash-lite"),
    messages,
    system: giftConsultantPrompt(occasion),
    stopWhen: stepCountIs(1),
    tools: getTools(
      closeInterview,
      flagInappropriateRequest,
      askAQuestionWithAnswerSuggestions,
    ),
  });
}

export type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;
