import { openai } from "@ai-sdk/openai";
import type { ModelMessage, UIMessage } from "ai";
import { generateObject } from "ai";
import { z } from "zod";

import { factExtractPrompt } from "./prompt";

export async function extractFacts({ input }: { input: ModelMessage }) {
  return await generateObject({
    model: openai("gpt-5-nano"),
    prompt: [input],
    system: factExtractPrompt,
    schema: z.object({
      facts: z
        .array(z.string())
        .describe(
          "List of extracted facts relevant for gift suggestions, could be 0",
        ),
    }),
  });
}

export type MyUIMessage = UIMessage<never>;
