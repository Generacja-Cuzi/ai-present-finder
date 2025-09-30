import { ContextDto } from "../models/context.dto";
import { EndConversationOutput } from "../models/end-converstion-ai-output";

export class EndInterviewCommand {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
