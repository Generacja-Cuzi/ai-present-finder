import { ChatMessage } from '../models/chat-message';
import { ContextDto } from '../models/context.dto';

export class ChatUserAnsweredEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly messages: ChatMessage[],
  ) {}
}
