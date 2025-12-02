import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { RecipientProfile } from "@core/types";
import type { GenerateTextResult, ModelMessage } from "ai";
import {
  generateObject,
  generateText,
  hasToolCall,
  modelMessageSchema,
  stepCountIs,
} from "ai";

import type { Logger } from "@nestjs/common";

import { giftConsultantPrompt } from "./prompt";
import { giftRefinementPrompt } from "./refinement-prompt";
import { tools } from "./tools";
import type { EndConversationOutput, PotencialAnswers } from "./types";

export async function giftInterviewFlow({
  logger,
  occasion,
  messages,
  userProfile,
  onQuestionAsked,
  onInterviewCompleted,
  onInappropriateRequest,
}: {
  logger: Logger;
  occasion: string;
  messages: ModelMessage[];
  userProfile?: RecipientProfile;
  onQuestionAsked: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void;
  onInterviewCompleted: (output: EndConversationOutput) => void;
  onInappropriateRequest: (reason: string) => void;
}) {
  // Count questions asked so far (assistant messages)
  const questionCount = messages.filter(
    (message) => message.role === "assistant",
  ).length;
  const maxRetries = 3;
  const validatedMessages = modelMessageSchema.array().parse(messages);
  let results: GenerateTextResult<typeof tools, never> | null = null;
  let retryCount = 0;

  const buildSystemPrompt = (missingToolCallHint?: string) =>
    giftConsultantPrompt(
      occasion,
      userProfile,
      questionCount,
      missingToolCallHint,
    );

  const stopConditions = [
    hasToolCall("ask_a_question_with_answer_suggestions"),
    hasToolCall("end_conversation"),
    hasToolCall("flag_inappropriate_request"),
    stepCountIs(1),
  ];

  const repairToolCall = async ({
    toolCall,
    error: repairError,
    system,
    messages: stepMessages,
  }: Parameters<
    NonNullable<
      Parameters<typeof generateText>[0]["experimental_repairToolCall"]
    >
  >[0]) => {
    const errorMessage =
      repairError instanceof Error ? repairError.message : String(repairError);
    logger.warn(
      `Attempting tool call repair for ${toolCall.toolName} (${toolCall.toolCallId}): ${errorMessage}`,
    );

    if (!(toolCall.toolName in tools)) {
      logger.error(
        `Cannot repair tool call for unknown tool: ${toolCall.toolName}`,
      );
      return null;
    }

    const toolDefinition = tools[toolCall.toolName as keyof typeof tools];

    const repairResult = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `${system ?? ""}\n\nNapraw wywołanie narzędzia "${toolCall.toolName}". Poprzednie dane były niepoprawne (${errorMessage}). Zweryfikuj i zwróć tylko poprawne JSON argumentów bez dodatkowego tekstu.`,
      messages: stepMessages,
      schema: toolDefinition.inputSchema,
      schemaName: `${toolCall.toolName}-repair`,
      schemaDescription:
        "Corrected arguments for a failed tool call. Only include valid fields.",
      mode: "json",
      maxRetries: 1,
    });

    return {
      ...toolCall,
      input: JSON.stringify(repairResult.object),
    };
  };

  while (retryCount <= maxRetries) {
    try {
      const missingToolCallReminder =
        retryCount === 0
          ? undefined
          : "Poprzednia próba nie wywołała żadnego narzędzia - pamiętaj, że narzędzia są obowiązkowe i musisz użyć właściwego narzędzia zamiast samodzielnie odpowiadać.";

      results = await generateText({
        model: google("gemini-2.5-flash"),
        messages: validatedMessages,
        system: buildSystemPrompt(missingToolCallReminder),
        stopWhen: stopConditions,
        tools,
        toolChoice: "required", // This forces the AI to always call a tool
        experimental_repairToolCall: repairToolCall,
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
        continue;
      } else {
        logger.warn(
          `No tool calls produced after ${maxRetries.toString()} retries; proceeding without tool calls`,
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

  if (results === null) {
    throw new Error("No results returned from text generation");
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

export async function giftRefinementFlow({
  logger,
  occasion,
  messages,
  userProfile,
  selectedGiftsContext,
  onQuestionAsked,
  onInterviewCompleted,
  onInappropriateRequest,
}: {
  logger: Logger;
  occasion: string;
  messages: ModelMessage[];
  userProfile: RecipientProfile;
  selectedGiftsContext: {
    title: string;
    description: string;
    category: string | null;
    priceLabel: string | null;
  }[];
  onQuestionAsked: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void;
  onInterviewCompleted: (output: EndConversationOutput) => void;
  onInappropriateRequest: (reason: string) => void;
}) {
  // Count questions asked so far in refinement (assistant messages)
  const questionCount = messages.filter(
    (message) => message.role === "assistant",
  ).length;
  const maxRetries = 3;
  const validatedMessages = modelMessageSchema.array().parse(messages);
  let results: GenerateTextResult<typeof tools, never> | null = null;
  let retryCount = 0;

  const buildSystemPrompt = (missingToolCallHint?: string) =>
    giftRefinementPrompt(
      occasion,
      userProfile,
      questionCount,
      selectedGiftsContext,
      missingToolCallHint,
    );

  const stopConditions = [
    hasToolCall("ask_a_question_with_answer_suggestions"),
    hasToolCall("end_conversation"),
    hasToolCall("flag_inappropriate_request"),
    stepCountIs(1),
  ];

  const repairToolCall = async ({
    toolCall,
    error: repairError,
    system,
    messages: stepMessages,
  }: Parameters<
    NonNullable<
      Parameters<typeof generateText>[0]["experimental_repairToolCall"]
    >
  >[0]) => {
    const errorMessage =
      repairError instanceof Error ? repairError.message : String(repairError);
    logger.warn(
      `Attempting tool call repair for ${toolCall.toolName} (${toolCall.toolCallId}): ${errorMessage}`,
    );

    if (!(toolCall.toolName in tools)) {
      logger.error(
        `Cannot repair tool call for unknown tool: ${toolCall.toolName}`,
      );
      return null;
    }

    const toolDefinition = tools[toolCall.toolName as keyof typeof tools];

    const repairResult = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `${system ?? ""}\n\nNapraw wywołanie narzędzia "${toolCall.toolName}". Poprzednie dane były niepoprawne (${errorMessage}). Zweryfikuj i zwróć tylko poprawne JSON argumentów bez dodatkowego tekstu.`,
      messages: stepMessages,
      schema: toolDefinition.inputSchema,
      schemaName: `${toolCall.toolName}-repair`,
      schemaDescription:
        "Corrected arguments for a failed tool call. Only include valid fields.",
      mode: "json",
      maxRetries: 1,
    });

    return {
      ...toolCall,
      input: JSON.stringify(repairResult.object),
    };
  };

  while (retryCount <= maxRetries) {
    try {
      const missingToolCallReminder =
        retryCount === 0
          ? undefined
          : "Poprzednia próba nie wywołała żadnego narzędzia - pamiętaj, że narzędzia są obowiązkowe i musisz użyć właściwego narzędzia zamiast samodzielnie odpowiadać.";

      results = await generateText({
        model: google("gemini-2.5-flash"),
        messages: validatedMessages,
        system: buildSystemPrompt(missingToolCallReminder),
        stopWhen: stopConditions,
        tools,
        toolChoice: "required", // This forces the AI to always call a tool
        experimental_repairToolCall: repairToolCall,
        onStepFinish: (step) => {
          logger.log(`Refinement step finished: ${JSON.stringify(step)}`);
        },
      });

      logger.log(
        `Refinement results.toolResults.length: ${results.toolResults.length.toString()}`,
      );
      logger.log(
        `Full refinement results: ${JSON.stringify(results, null, 2)}`,
      );

      // If we have tool results, break out of the retry loop
      if (results.toolResults.length > 0) {
        break;
      }

      // If no tool results and we haven't exceeded max retries, try again
      if (retryCount < maxRetries) {
        retryCount++;
        logger.log(
          `No tool calls found in refinement, retrying (attempt ${retryCount.toString()}/${maxRetries.toString()})`,
        );
        continue;
      } else {
        logger.warn(
          `No tool calls produced in refinement after ${maxRetries.toString()} retries; proceeding without tool calls`,
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
            `Schema validation error in refinement, retrying (attempt ${retryCount.toString()}/${maxRetries.toString()}): ${error.message}`,
          );
          continue;
        } else {
          logger.error(
            `Schema validation error in refinement after ${maxRetries.toString()} retries: ${error.message}`,
          );
          throw error;
        }
      } else {
        // Re-throw non-schema errors immediately
        throw error;
      }
    }
  }

  if (results === null) {
    throw new Error("No results returned from refinement text generation");
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
          `Unhandled tool result in refinement: ${JSON.stringify(_exhaustiveCheck)}`,
        );
      }
    }
  }
}
