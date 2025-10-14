import type { RecipientProfile } from "@core/types";

export class InitializeGiftContextCommand {
  constructor(
    public readonly eventId: string,
    public readonly chatId: string,
    public readonly totalEvents: number,
    public readonly userProfile: RecipientProfile | null,
    public readonly keywords: string[],
  ) {}
}
