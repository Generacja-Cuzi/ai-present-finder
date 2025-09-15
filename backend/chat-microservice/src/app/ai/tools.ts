import { InferUITools, tool } from 'ai';
import z from 'zod';
import { EndConversationOutput } from './types';

export function getTools(
  closeInterview: (output: EndConversationOutput) => void,
  flagInappropriateRequest: (reason: string) => void,
) {
  return {
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
        output: EndConversationOutput,
      }),
      execute: ({ output }) => {
        console.log('Ending conversation with output:', output);
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
        console.log('Flagging inappropriate request with reason:', reason);
        flagInappropriateRequest(reason);
        return { success: true, flagged: true, reason };
      },
    }),
  } as const;
}

export type MyUITools = InferUITools<ReturnType<typeof getTools>>;
