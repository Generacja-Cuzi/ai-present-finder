import { ContextDto } from '../models/context.dto';
import { EndConversationOutput } from 'src/app/ai/types';

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput,
  ) {}
}
