import { Controller, Post, Body, Res } from '@nestjs/common';
import { streamText } from 'ai';
import { UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { IncomingMessage, ServerResponse } from 'node:http';

@Controller('api/chat')
export class ChatController {
  @Post()
  chat(
    @Res() res: ServerResponse<IncomingMessage>,
    @Body() body: { messages: UIMessage[] },
  ) {
    const { messages } = body;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToModelMessages(messages),
      system: 'You are a helpful assistant that likes to use "hello jello"',
    });

    result.pipeUIMessageStreamToResponse(res);
  }
}
