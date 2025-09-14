import { ContextDto } from '../models/context.dto';
import { ChatMessage } from '../models/chat-message';

export class ChatInterviewCompleted {
  constructor(
    public readonly context: ContextDto,
    public readonly messages: ChatMessage[],
  ) {}
}
