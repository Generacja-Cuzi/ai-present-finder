import { GetUserProfileByIdQuery } from "src/domain/queries/get-user-profile-by-id.query";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";

import { Logger, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { UserProfile } from "../../domain/entities/user-profile.entity";

@QueryHandler(GetUserProfileByIdQuery)
export class GetUserProfileByIdHandler
  implements IQueryHandler<GetUserProfileByIdQuery, UserProfile>
{
  private readonly logger = new Logger(GetUserProfileByIdHandler.name);

  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(query: GetUserProfileByIdQuery): Promise<UserProfile> {
    this.logger.log(
      `Getting profile ${query.profileId} for user: ${query.userId}`,
    );

    const profile = await this.userProfileRepository.findById(query.profileId);

    if (profile === null) {
      throw new NotFoundException(
        `Profile with ID ${query.profileId} not found`,
      );
    }

    // Verify ownership
    if (profile.userId !== query.userId) {
      throw new NotFoundException(
        `Profile with ID ${query.profileId} not found`,
      );
    }

    return profile;
  }
}
