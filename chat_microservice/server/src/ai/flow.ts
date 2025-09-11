import { openai } from '@ai-sdk/openai';
import { giftConsultantPrompt } from './prompt';
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  stepCountIs,
  UIDataTypes,
} from 'ai';
import { MyUITools, tools } from './tools';

export function giftInterviewFlow({ messages }: { messages: UIMessage[] }) {
  return streamText({
    model: openai('gpt-5-nano'),
    messages: convertToModelMessages(messages),
    system: giftConsultantPrompt,
    stopWhen: stepCountIs(5),
    tools,
  });
}

export type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;
