import { openai } from '@ai-sdk/openai';
import { giftConsultantPrompt } from './prompt';
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from 'ai';
import z from 'zod';

export function giftInterviewFlow({ messages }: { messages: UIMessage[] }) {
  return streamText({
    model: openai('gpt-5-nano'),
    messages: convertToModelMessages(messages),
    system: giftConsultantPrompt,
    stopWhen: stepCountIs(5),

    tools: {
      proceed_to_next_phase: tool({
        description:
          'Call this tool to signal moving from Part I to Part II, or from Part II to Part III of the conversation.',
        inputSchema: z.object({}),
        execute: () => {
          console.log('Proceeding to next phase');
          return { success: true, message: 'Proceeding to next phase' };
        },
      }),
      end_conversation: tool({
        description:
          'Call this tool to end the conversation with the final structured profile output.',
        inputSchema: z.object({
          output: z.object({
            recipient_profile: z.array(z.string()),
            key_themes_and_keywords: z.array(z.string()),
            gift_recommendations: z.array(z.string()),
          }),
        }),
        execute: ({ output }) => {
          console.log('Ending conversation with output:', output);
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
          console.log('Flagging inappropriate request with reason:', reason);
          return { success: true, flagged: true, reason };
        },
      }),
    },
  });
}
