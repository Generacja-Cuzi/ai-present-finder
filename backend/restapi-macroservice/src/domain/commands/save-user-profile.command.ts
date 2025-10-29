import type { RecipientProfile } from "../entities/user-profile.entity";

export class SaveUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
    public readonly personName: string,
    public readonly profile: RecipientProfile,
    public readonly keyThemes: string[],
  ) {}
}
