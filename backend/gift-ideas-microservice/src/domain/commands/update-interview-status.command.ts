import type { RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class UpdateInterviewStatusCommand extends Command<void> {
  constructor(
    public readonly chatId: string,
    public readonly profile: RecipientProfile,
    public readonly keyThemes: string[],
  ) {
    super();
  }
}
