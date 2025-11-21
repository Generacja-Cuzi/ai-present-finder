import { GoogleService } from "src/app/services/google-service";
import { ValidateGoogleTokenCommand } from "src/domain/commands/validate-google-token.command";
import type { User } from "src/domain/entities/user.entity";
import { UserRole } from "src/domain/entities/user.entity";
import type {
  JwtPayload,
  RefreshTokenPayload,
} from "src/domain/models/auth.types";
import { IUserRepository } from "src/domain/repositories/iuser.repository";

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";

@CommandHandler(ValidateGoogleTokenCommand)
export class ValidateGoogleTokenHandler
  implements ICommandHandler<ValidateGoogleTokenCommand>
{
  private readonly logger = new Logger(ValidateGoogleTokenHandler.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: ValidateGoogleTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { code } = command;

    this.logger.log(
      `validateGoogleToken called with code: ${code.slice(0, 10)}...`,
    );
    const { email, refreshToken, accessToken, givenName, familyName, picture } =
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
        givenName,
        familyName,
        picture,
        accessToken,
        refreshToken,
        role: UserRole.USER,
      });
      this.logger.log(`User created with id: ${user.id}`);
    } else {
      this.logger.log(`Updating existing user with id: ${user.id}`);
      user = await this.userRepository.update(user.id, {
        accessToken,
        refreshToken,
        givenName,
        familyName,
        picture,
      });
      this.logger.log(`User updated successfully`);
    }

    const jwt = this.generateJwt(user);
    const refreshJwt = this.generateRefreshToken(user);

    return { accessToken: jwt, refreshToken: refreshJwt, user };
  }

  private generateJwt(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, { expiresIn: "15m" });
  }

  private generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: "refresh",
    };
    const secret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ??
      this.configService.get<string>("JWT_SECRET") ??
      "your-refresh-secret-key-change-in-prod";

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: "7d",
    });
  }
}
