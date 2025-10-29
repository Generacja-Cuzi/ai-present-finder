import { Query } from "@nestjs/cqrs";

import type { UserProfile } from "../entities/user-profile.entity";

export class GetUserProfilesQuery extends Query<UserProfile[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
