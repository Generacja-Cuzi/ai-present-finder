import type { UserProfile } from "src/domain/entities/user-profile.entity";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";
import { Repository } from "typeorm";

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { UserProfile as UserProfileEntity } from "../domain/entities/user-profile.entity";

@Injectable()
export class UserProfileDatabaseRepository implements IUserProfileRepository {
  private readonly logger = new Logger(UserProfileDatabaseRepository.name);

  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
  ) {}

  async findById(id: string): Promise<UserProfile | null> {
    return this.userProfileRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<UserProfile[]> {
    return this.userProfileRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findByUserIdAndPersonName(
    userId: string,
    personName: string,
  ): Promise<UserProfile | null> {
    return this.userProfileRepository.findOne({
      where: { userId, personName },
    });
  }

  async create(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.userProfileRepository.create(profileData);
    return this.userProfileRepository.save(profile);
  }

  async update(
    id: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    await this.userProfileRepository.update(id, profileData);
    const updatedProfile = await this.findById(id);
    if (updatedProfile === null) {
      throw new NotFoundException(`UserProfile with id ${id} not found`);
    }
    return updatedProfile;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`UserProfile with id ${id} not found`);
    }
  }

  async isOwnedByUser(profileId: string, userId: string): Promise<boolean> {
    const profile = await this.userProfileRepository.findOne({
      where: { id: profileId },
      select: ["userId"],
    });

    return profile?.userId === userId;
  }
}
