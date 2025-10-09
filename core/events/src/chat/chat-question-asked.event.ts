import type { ContextDto } from "@core/types";

export class ChatQuestionAskedEvent {
  constructor(
    public readonly context: ContextDto,
    public readonly question: string,
  ) {}
}
