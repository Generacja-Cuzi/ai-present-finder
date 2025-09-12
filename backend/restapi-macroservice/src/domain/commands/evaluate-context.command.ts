import { Command } from '@nestjs/cqrs';
import { ContextDto } from '../models/context.dto';

export class EvaluateContextCommand extends Command<void> {
  constructor(
    public readonly context: ContextDto,
    public readonly history?: string[],
  ) {
    super();
  }
}
