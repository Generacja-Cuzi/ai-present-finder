import { Context } from 'vm';
import { ContextDto } from '../models/context.dto';

export class ChatQuestionAskedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: string[],
    public readonly question: string,
  ) {}
}
