import { google } from "@ai-sdk/google";
import type { ModelMessage } from "ai";
import { generateText, stepCountIs } from "ai";

import type { Logger } from "@nestjs/common";

import { giftConsultantPrompt } from "./prompt";
import { tools } from "./tools";
import type { EndConversationOutput, PotencialAnswers } from "./types";

export async function giftInterviewFlow({
  logger,
  occasion,
  messages,
  onQuestionAsked,
  onInterviewCompleted,
  onInappropriateRequest,
}: {
  logger: Logger;
  occasion: string;
  messages: ModelMessage[];
  onQuestionAsked: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void;
  onInterviewCompleted: (output: EndConversationOutput) => void;
  onInappropriateRequest: (reason: string) => void;
}) {
  const results = await generateText({
    model: google("gemini-2.5-flash-lite"),
    messages,
    system: giftConsultantPrompt(occasion),
    stopWhen: stepCountIs(1),
    tools,
    toolChoice: "required", // This forces the AI to always call a tool
    onStepFinish: (step) => {
      logger.log(`Step finished: ${JSON.stringify(step)}`);
    },
    maxRetries: 5,
  });
  logger.log(
    `results.toolResults.length: ${results.toolResults.length.toString()}`,
  );
  for (const toolResult of results.toolResults) {
    if (toolResult.dynamic !== undefined && toolResult.dynamic) {
      continue; // rule out dynamic tool results
    }
    switch (toolResult.toolName) {
      case "ask_a_question_with_answer_suggestions": {
        onQuestionAsked(
          toolResult.input.question,
          toolResult.input.potentialAnswers,
        );
        break;
      }
      case "end_conversation": {
        onInterviewCompleted(toolResult.input.output);
        break;
      }
      case "flag_inappropriate_request": {
        onInappropriateRequest(toolResult.input.reason);
        break;
      }
      default: {
        const _exhaustiveCheck: never = toolResult;
        throw new Error(
          `Unhandled tool result: ${JSON.stringify(_exhaustiveCheck)}`,
        );
      }
    }
  }
}
