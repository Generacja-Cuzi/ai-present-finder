import type { RecipientProfile } from "@core/types";

import { Command } from "@nestjs/cqrs";

export class GenerateGiftIdeasCommand extends Command<void> {
  constructor(
    public readonly userProfile: RecipientProfile | null,
    public readonly keywords: string[], // stalking keywords
    public readonly keyThemes: string[], // interview key themes (highest priority)
    public readonly chatId: string,
    public readonly minPrice?: number | null,
    public readonly maxPrice?: number | null,
    public readonly saveProfile?: boolean,
    public readonly profileName?: string | null,
  ) {
    super();
  }
}
