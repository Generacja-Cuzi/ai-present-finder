import type { User } from "src/domain/entities/user.entity";
import { IUserRepository } from "src/domain/repositories/iuser.repository";
import { Repository } from "typeorm";

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User as UserEntity } from "../domain/entities/user.entity";

@Injectable()
export class UserDatabaseRepository implements IUserRepository {
  private readonly logger = new Logger(UserDatabaseRepository.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
    const userFound = user !== null;
    this.logger.log(
      `User found: ${String(userFound)}, id: ${user?.id ?? "N/A"}`,
    );
    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findById(id);
    if (updatedUser === null) {
      throw new Error(`User with id ${id} not found`);
    }
    return updatedUser;
  }
}
