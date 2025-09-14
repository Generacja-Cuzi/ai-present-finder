import { ContextDto } from '../models/context.dto';

export class ChatAnswerProcessedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: string[],
  ) {}
}
