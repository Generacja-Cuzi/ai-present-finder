import { ContextDto } from "../models/context.dto";

export class ChatAskQuestionEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly history: string[],
  ) {}
}
