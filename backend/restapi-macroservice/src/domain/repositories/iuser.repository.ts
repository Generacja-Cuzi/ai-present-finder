import type { User } from "../entities/user.entity";

export abstract class IUserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByGoogleId(googleId: string): Promise<User | null>;
  abstract create(userData: Partial<User>): Promise<User>;
  abstract update(id: string, userData: Partial<User>): Promise<User>;
}
