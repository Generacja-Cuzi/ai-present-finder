import type { RecipientProfile } from "@core/types";

export class ChatStartInterviewEvent {
  constructor(
    public readonly chatId: string,
    public readonly occasion: string,
    public readonly userProfile?: RecipientProfile,
  ) {}
}
