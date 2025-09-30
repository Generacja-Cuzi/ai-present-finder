import type { ContextDto } from "../models/context.dto";

export class ChatQuestionAskedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly question: string,
  ) {}
}
