import { EndConversationOutput } from '../models/end-converstion-ai-output';
import { ContextDto } from '../models/context.dto';

export class EndInterviewCommand {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
