import { Query } from "@nestjs/cqrs";

import type { UserProfile } from "../entities/user-profile.entity";

export class GetUserProfileByIdQuery extends Query<UserProfile> {
  constructor(
    public readonly profileId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
