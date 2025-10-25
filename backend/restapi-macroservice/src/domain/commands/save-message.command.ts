import { Command } from "@nestjs/cqrs";

import type { MessageRole } from "../entities/message.entity";

export class SaveMessageCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly content: string,
    public readonly role: MessageRole,
    public readonly proposedAnswers?: {
      type: "select" | "long_free_text";
      answers?: {
        answerFullSentence: string;
        answerShortForm: string;
      }[];
    } | null,
  ) {
    super();
  }
}
