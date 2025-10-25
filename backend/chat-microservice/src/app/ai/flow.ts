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
    try {
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
    } catch (error) {
      // Check if this is a schema validation error
      if (
        error instanceof Error &&
        error.message.includes("Type validation failed")
      ) {
        if (retryCount < maxRetries) {
          retryCount++;
          logger.warn(
            `Schema validation error, retrying (attempt ${retryCount.toString()}/${maxRetries.toString()}): ${error.message}`,
          );
          continue;
        } else {
          logger.error(
            `Schema validation error after ${maxRetries.toString()} retries: ${error.message}`,
          );
          throw error;
        }
      } else {
        // Re-throw non-schema errors immediately
        throw error;
      }
    }
  }

  if (results === null || results.toolResults.length === 0) {
    onQuestionAsked(results?.text ?? "No tool results found", {
      type: "long_free_text",
    });
    return;
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
