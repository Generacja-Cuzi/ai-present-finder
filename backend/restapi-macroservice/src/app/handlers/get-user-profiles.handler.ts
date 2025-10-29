import { GetUserProfilesQuery } from "src/domain/queries/get-user-profiles.query";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";

import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { UserProfile } from "../../domain/entities/user-profile.entity";

@QueryHandler(GetUserProfilesQuery)
export class GetUserProfilesHandler
  implements IQueryHandler<GetUserProfilesQuery, UserProfile[]>
{
  private readonly logger = new Logger(GetUserProfilesHandler.name);

  constructor(private readonly userProfileRepository: IUserProfileRepository) {}

  async execute(query: GetUserProfilesQuery): Promise<UserProfile[]> {
    this.logger.log(`Getting profiles for user: ${query.userId}`);
    return this.userProfileRepository.findByUserId(query.userId);
  }
}
