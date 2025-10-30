import type { RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class SaveUserProfileCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
    public readonly personName: string,
    public readonly profile: RecipientProfile,
    public readonly keyThemes: string[],
  ) {
    super();
  }
}
