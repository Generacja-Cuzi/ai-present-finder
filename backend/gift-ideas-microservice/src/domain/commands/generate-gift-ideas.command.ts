import type { RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class GenerateGiftIdeasCommand extends Command<void> {
  constructor(
    public readonly userProfile: RecipientProfile | null,
    public readonly keywords: string[],
    public readonly chatId: string,
  ) {
    super();
  }
}
