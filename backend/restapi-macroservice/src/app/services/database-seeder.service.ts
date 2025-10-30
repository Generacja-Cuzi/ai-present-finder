import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { UserRole } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/iuser.repository";

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly userRepository: IUserRepository) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = "272715@student.pwr.edu.pl";

    try {
      const existingAdmin = await this.userRepository.findByEmail(adminEmail);

      if (existingAdmin === null) {
        await this.userRepository.create({
          email: adminEmail,
          name: "Admin User",
          role: UserRole.ADMIN,
        });
        this.logger.log(`Created admin user: ${adminEmail}`);
      } else {
        if (existingAdmin.role === UserRole.ADMIN) {
          this.logger.log(`Admin user ${adminEmail} already exists`);
        } else {
          await this.userRepository.update(existingAdmin.id, {
            role: UserRole.ADMIN,
          });
          this.logger.log(
            `Updated user ${adminEmail} to ADMIN role during seeding`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to seed admin user: ${String(error)}`);
    }
  }
}
