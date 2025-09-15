import { ContextDto } from '../models/context.dto';
import { ChatMessage } from '../models/chat-message';

export class ChatStartInterviewEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {}
}
