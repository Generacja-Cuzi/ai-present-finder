import { google } from "@ai-sdk/google";
import type { ModelMessage, UIDataTypes, UIMessage } from "ai";
import { generateText, stepCountIs } from "ai";

import type { Logger } from "@nestjs/common";

import { giftConsultantPrompt } from "./prompt";
import type { MyUITools } from "./tools";
import { getTools } from "./tools";
import type { EndConversationOutput, PotencialAnswers } from "./types";

export async function giftInterviewFlow({
  logger,
  occasion,
  messages,
  closeInterview,
  flagInappropriateRequest,
  askAQuestionWithAnswerSuggestions,
}: {
  logger: Logger;
  occasion: string;
  messages: ModelMessage[];
  closeInterview: (output: EndConversationOutput) => void;
  flagInappropriateRequest: (reason: string) => void;
  askAQuestionWithAnswerSuggestions: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void;
}) {
  const results = await generateText({
    model: google("gemini-2.5-flash-lite"),
    messages,
    system: giftConsultantPrompt(occasion),
    stopWhen: stepCountIs(1),
    tools: getTools(
      closeInterview,
      flagInappropriateRequest,
      askAQuestionWithAnswerSuggestions,
    ),
    toolChoice: "required", // This forces the AI to always call a tool
    maxRetries: 5,

    temperature: 0.1,
  });

  logger.log(
    `AI response: ${JSON.stringify(results.response.messages[0].content)}`,
  );
}

export type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;
