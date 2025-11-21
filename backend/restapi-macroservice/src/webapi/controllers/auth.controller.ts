import { Request, Response } from "express";
import { ValidateGoogleTokenCommand } from "src/domain/commands/validate-google-token.command";
import type { User } from "src/domain/entities/user.entity";
import { IUserRepository } from "src/domain/repositories/iuser.repository";
import { UserInfoDto } from "src/webapi/dtos/user.dto";

import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommandBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GoogleService } from "../../app/services/google-service";
import {
  AuthResponseDto,
  GoogleAuthDto,
  GoogleAuthUrlDto,
} from "../../domain/models/auth.dto";
import type {
  JwtPayload,
  RefreshTokenPayload,
} from "../../domain/models/auth.types";

interface GoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly googleService: GoogleService,
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {}

  @Get("google/url")
  @ApiOperation({ summary: "Get Google OAuth URL" })
  @ApiOkResponse({
    description: "Returns Google OAuth authorization URL",
    type: GoogleAuthUrlDto,
  })
  getGoogleAuthUrl(): GoogleAuthUrlDto {
    return this.googleService.getOAuth2ClientUrl();
  }

  @Post("google/callback")
  @ApiOperation({ summary: "Handle Google OAuth callback" })
  @ApiOkResponse({
    description: "Sets JWT token in httpOnly cookie and returns user info",
    type: AuthResponseDto,
  })
  async googleCallback(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<AuthResponseDto, "accessToken" | "refreshToken">> {
    this.logger.log("googleCallback called with code:", googleAuthDto.code);
    const result = await this.commandBus.execute<
      ValidateGoogleTokenCommand,
      GoogleAuthResult
    >(new ValidateGoogleTokenCommand(googleAuthDto.code));
    this.logger.log("User authenticated via Google OAuth");

    response.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    response.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        givenName: result.user.givenName ?? "",
        familyName: result.user.familyName ?? "",
        picture: result.user.picture ?? "",
        role: result.user.role,
      },
    };
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout user by clearing auth cookie" })
  @ApiOkResponse({ description: "Successfully logged out" })
  logout(@Res({ passthrough: true }) response: Response): { message: string } {
    this.logger.log("User logging out");
    response.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    response.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return { message: "Successfully logged out" };
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user from cookie" })
  @ApiOkResponse({
    description: "Returns current user info",
    type: UserInfoDto,
  })
  async getCurrentUser(@Req() request: Request): Promise<UserInfoDto> {
    const token: string | undefined = request.cookies.access_token as
      | string
      | undefined;

    if (token === undefined || token === "") {
      throw new UnauthorizedException("Not authenticated");
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userRepository.findById(payload.sub);

      if (user === null) {
        throw new UnauthorizedException("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        givenName: user.givenName ?? "",
        familyName: user.familyName ?? "",
        picture: user.picture ?? "",
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiOkResponse({
    description: "Returns new access token",
  })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken: string | undefined = request.cookies.refresh_token as
      | string
      | undefined;

    if (refreshToken === undefined || refreshToken === "") {
      throw new UnauthorizedException("No refresh token provided");
    }

    try {
      const secret =
        this.configService.get<string>("JWT_REFRESH_SECRET") ??
        this.configService.get<string>("JWT_SECRET") ??
        "your-refresh-secret-key-change-in-prod";

      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        { secret },
      );

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      const user = await this.userRepository.findById(payload.sub);

      if (user === null) {
        throw new UnauthorizedException("User not found");
      }

      // Generate new access token
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        } as JwtPayload,
        { expiresIn: "15m" },
      );

      response.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });

      return { message: "Token refreshed successfully" };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
