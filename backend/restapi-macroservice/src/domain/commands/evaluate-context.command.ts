import { Command } from '@nestjs/cqrs';
import { ContextDto } from '../models/context.dto';
import { ChatMessage } from '../models/chat-message';

export class EvaluateContextCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly messages?: ChatMessage[],
  ) {
    super();
  }
}
