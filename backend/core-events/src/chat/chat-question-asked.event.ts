import type { ContextDto } from "../types";

export class ChatQuestionAskedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly question: string,
  ) {}
}
