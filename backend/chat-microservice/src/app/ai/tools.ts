import type { InferUITools } from "ai";
import { tool } from "ai";
import {
  endConversationOutputSchema,
  potencialAnswersSchema,
} from "src/app/ai/types";
import { z } from "zod";

export const tools = {
  ask_a_question_with_answer_suggestions: tool({
    description:
      "Provide 4 potential answers that user can choose from to anwser the question you've just asked. This makes the conversation faster and more structured.",
    inputSchema: z.object({
      question: z.string().describe("The question you want to ask the user"),
      potentialAnswers: potencialAnswersSchema.describe(
        "4 potential answers for the user to choose from or a long free text answer",
      ),
    }),
    execute: ({ question, potentialAnswers }) => {
      return {
        type: "ask_question",
        question,
        potentialAnswers,
      };
    },
  }),
  end_conversation: tool({
    description:
      "Call this tool to end the conversation with the final structured profile output.",
    inputSchema: z.object({
      output: endConversationOutputSchema,
    }),
    execute: ({ output }) => {
      return {
        type: "end_conversation",
        output,
      };
    },
  }),
  flag_inappropriate_request: tool({
    description:
      "Call this tool if the user's request is ethically problematic, illegal, or involves harmful content.",
    inputSchema: z.object({
      reason: z.string(),
    }),
    execute: ({ reason }) => {
      return {
        type: "flag_inappropriate",
        reason,
      };
    },
  }),
} as const;
