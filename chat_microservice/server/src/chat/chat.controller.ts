import { Controller, Post, Body, Res } from '@nestjs/common';
import { UIMessage } from 'ai';
import { giftInterviewFlow } from '../ai/flow';
import { IncomingMessage, ServerResponse } from 'node:http';

@Controller('api/chat')
export class ChatController {
  @Post()
  chat(
    @Res() res: ServerResponse<IncomingMessage>,
    @Body() body: { messages: UIMessage[] },
  ) {
    const { messages } = body;
    const result = giftInterviewFlow({ messages });
    result.pipeUIMessageStreamToResponse(res);
  }
}
