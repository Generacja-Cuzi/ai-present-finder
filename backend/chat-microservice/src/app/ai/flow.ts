import { google } from "@ai-sdk/google";
import type { GenerateTextResult, ModelMessage } from "ai";
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
  const maxRetries = 3;
  let results: GenerateTextResult<typeof tools, never> | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    results = await generateText({
      model: google("gemini-2.5-flash-lite"),
      messages,
      system: giftConsultantPrompt(occasion),
      stopWhen: stepCountIs(1),
      tools,
      toolChoice: "required", // This forces the AI to always call a tool
      onStepFinish: (step) => {
        logger.log(`Step finished: ${JSON.stringify(step)}`);
      },
      temperature: 0.8, // Lower temperature for more consistent tool calling
    });

    logger.log(
      `results.toolResults.length: ${results.toolResults.length.toString()}`,
    );
    logger.log(`Full results: ${JSON.stringify(results, null, 2)}`);

    // If we have tool results, break out of the retry loop
    if (results.toolResults.length > 0) {
      break;
    }

    // If no tool results and we haven't exceeded max retries, try again
    if (retryCount < maxRetries) {
      retryCount++;
      logger.log(
        `No tool calls found, retrying (attempt ${retryCount.toString()}/${maxRetries.toString()})`,
      );
    } else {
      logger.warn(
        `No tool calls found after ${maxRetries.toString()} retries, proceeding with empty results`,
      );
      break;
    }
  }

  if (results === null || results.toolResults.length === 0) {
    throw new Error("No results found");
  }

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
