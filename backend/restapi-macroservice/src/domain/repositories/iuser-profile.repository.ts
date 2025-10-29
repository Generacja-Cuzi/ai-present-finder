import type { UserProfile } from "../entities/user-profile.entity";

export abstract class IUserProfileRepository {
  abstract findById(id: string): Promise<UserProfile | null>;
  abstract findByUserId(userId: string): Promise<UserProfile[]>;
  abstract findByUserIdAndPersonName(
    userId: string,
    personName: string,
  ): Promise<UserProfile | null>;
  abstract create(profileData: Partial<UserProfile>): Promise<UserProfile>;
  abstract update(
    id: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile>;
  abstract delete(id: string): Promise<void>;
}
