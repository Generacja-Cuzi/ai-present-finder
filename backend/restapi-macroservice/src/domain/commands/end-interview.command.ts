import type { ContextDto } from "../models/context.dto";
import type { EndConversationOutput } from "../models/end-converstion-ai-output";

export class EndInterviewCommand {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
