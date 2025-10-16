import { GoogleService } from "src/app/services/google-service";
import type { User } from "src/domain/entities/user.entity";
import { IUserRepository } from "src/domain/repositories/iuser.repository";

import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { JwtPayload } from "../../domain/models/auth.types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
  ) {}

  async validateGoogleToken(code: string): Promise<{
    accessToken: string;
    user: User;
  }> {
    this.logger.log(
      `validateGoogleToken called with code: ${code.slice(0, 10)}...`,
    );
    const { email, refreshToken, accessToken } =
      await this.googleService.getAuthClientData(code);

    this.logger.log(`Got user email: ${email}`);

    let user = await this.userRepository.findByEmail(email);

    const userFound = user !== null;
    this.logger.log(
      `User found: ${String(userFound)}, user: ${JSON.stringify(user)}`,
    );

    if (user === null) {
      this.logger.log(`Creating new user for email: ${email}`);
      user = await this.userRepository.create({
        email,
        googleId: email,
        accessToken,
        refreshToken,
      });
      this.logger.log(`User created with id: ${user.id}`);
    } else {
      this.logger.log(`Updating existing user with id: ${user.id}`);
      user = await this.userRepository.update(user.id, {
        accessToken,
        refreshToken,
      });
      this.logger.log(`User updated successfully`);
    }

    const jwt = this.generateJwt(user);

    return { accessToken: jwt, user };
  }

  generateJwt(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
}
