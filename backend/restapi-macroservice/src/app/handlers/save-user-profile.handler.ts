import { SaveUserProfileCommand } from "src/domain/commands/save-user-profile.command";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";

import { Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(SaveUserProfileCommand)
export class SaveUserProfileHandler
  implements ICommandHandler<SaveUserProfileCommand>
{
  private readonly logger = new Logger(SaveUserProfileHandler.name);

  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(command: SaveUserProfileCommand): Promise<void> {
    const { userId, chatId, personName, profile, keyThemes } = command;

    this.logger.log(
      `Saving user profile for user ${userId}, person: ${personName}`,
    );

    // Check if profile for this person already exists
    const existingProfile =
      await this.userProfileRepository.findByUserIdAndPersonName(
        userId,
        personName,
      );

    if (existingProfile === null) {
      // Create new profile
      await this.userProfileRepository.create({
        userId,
        chatId,
        personName,
        profile,
        keyThemes,
      });
      this.logger.log(`Created new profile for person: ${personName}`);
    } else {
      // Update existing profile
      await this.userProfileRepository.update(existingProfile.id, {
        chatId,
        profile,
        keyThemes,
      });
      this.logger.log(`Updated existing profile ${existingProfile.id}`);
    }
  }
}
