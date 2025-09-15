import { openai } from '@ai-sdk/openai';
import { giftConsultantPrompt } from './prompt';
import {
  generateText,
  UIMessage,
  stepCountIs,
  UIDataTypes,
  ModelMessage,
} from 'ai';
import { getTools, MyUITools } from './tools';
import { EndConversationOutput } from './types';

export function giftInterviewFlow({
  messages,
  closeInterview,
  flagInappropriateRequest,
}: {
  messages: ModelMessage[];
  closeInterview: (output: EndConversationOutput) => void;
  flagInappropriateRequest: (reason: string) => void;
}) {
  return generateText({
    model: openai('gpt-5-nano'),
    messages,
    system: giftConsultantPrompt,
    stopWhen: stepCountIs(5),
    tools: getTools(closeInterview, flagInappropriateRequest),
  });
}

export type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;
