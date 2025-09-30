import { EndConversationOutput } from "src/app/ai/types";

import { ContextDto } from "../models/context.dto";

export class ChatInterviewCompletedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly profile: EndConversationOutput,
  ) {}
}
