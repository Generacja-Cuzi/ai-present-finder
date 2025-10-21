import type { InferUITools } from "ai";
import { tool } from "ai";
import {
  endConversationOutputSchema,
  potencialAnswersSchema,
} from "src/app/ai/types";
import type { EndConversationOutput, PotencialAnswers } from "src/app/ai/types";
import { z } from "zod";

export function getTools(
  closeInterview: (output: EndConversationOutput) => void,
  flagInappropriateRequest: (reason: string) => void,
  askAQuestionWithAnswerSuggestions: (
    question: string,
    potentialAnswers: PotencialAnswers,
  ) => void,
) {
  return {
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
        askAQuestionWithAnswerSuggestions(question, potentialAnswers);
        return {
          success: true,
          potentialAnswers,
          message:
            potentialAnswers.type === "select"
              ? `Proposed ${potentialAnswers.answers.length.toString()} answer options`
              : "Proposed a long free text answer",
        };
      },
    }),
    proceed_to_next_phase: tool({
      description:
        "Call this tool to signal moving from Part I to Part II, or from Part II to Part III of the conversation.",
      inputSchema: z.object({}),
      execute: () => {
        return { success: true, message: "Proceeding to next phase" };
      },
    }),
    end_conversation: tool({
      description:
        "Call this tool to end the conversation with the final structured profile output.",
      inputSchema: z.object({
        output: endConversationOutputSchema,
      }),
      execute: ({ output }) => {
        closeInterview(output);
        return { success: true, output };
      },
    }),
    flag_inappropriate_request: tool({
      description:
        "Call this tool if the user's request is ethically problematic, illegal, or involves harmful content.",
      inputSchema: z.object({
        reason: z.string(),
      }),
      execute: ({ reason }) => {
        flagInappropriateRequest(reason);
        return { success: true, flagged: true, reason };
      },
    }),
  } as const;
}

export type MyUITools = InferUITools<ReturnType<typeof getTools>>;
