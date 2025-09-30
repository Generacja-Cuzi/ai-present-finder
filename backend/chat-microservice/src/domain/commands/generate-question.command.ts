import { ChatMessage } from "../models/chat-message";
import { ContextDto } from "../models/context.dto";

export class GenerateQuestionCommand {
  constructor(
    public readonly context: ContextDto,
    public readonly history: ChatMessage[],
  ) {}
}
