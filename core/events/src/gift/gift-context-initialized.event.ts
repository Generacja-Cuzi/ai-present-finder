import type { RecipientProfile } from "@core/types";

export class GiftContextInitializedEvent {
  constructor(
    public readonly userProfile: RecipientProfile | null,
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly eventId: string,
    public readonly totalEvents: number,
  ) {}
}
