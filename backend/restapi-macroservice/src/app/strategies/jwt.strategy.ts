import type { Request } from "express";
import { Strategy } from "passport-jwt";
import type { User } from "src/domain/entities/user.entity";
import { IUserRepository } from "src/domain/repositories/iuser.repository";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import type { JwtPayload } from "../../domain/models/auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: IUserRepository) {
    super({
      jwtFromRequest: (request: Request) => {
        // Extract JWT from httpOnly cookie instead of Authorization header
        const cookies = request.cookies as Record<string, string> | undefined;
        return cookies?.access_token ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "your-secret-key-change-in-prod",
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findById(payload.sub);
    if (user === null) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
