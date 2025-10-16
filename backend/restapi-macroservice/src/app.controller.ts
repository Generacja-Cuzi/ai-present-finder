import { Controller, Get, Query, Redirect } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Gift")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the welcome message for the Gift microservice",
  })
  @ApiOkResponse({
    description: "Returns a welcome message from the Gift service",
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("google-auth")
  @ApiOperation({
    summary: "Redirects to Google OAuth authentication",
  })
  @ApiOkResponse({
    description: "Redirects to Google OAuth URL",
  })
  @Redirect()
  googleAuth(): { url: string } {
    return this.appService.googleAuth();
  }

  @Get("google-callback")
  @ApiOperation({
    summary: "Handles Google OAuth callback",
  })
  @ApiOkResponse({
    description: "Redirects to login page after successful authentication",
  })
  @Redirect()
  async googleAuthCallback(
    @Query("code") code: string,
  ): Promise<{ url: string }> {
    const {
      email: _email,
      refreshToken: _refreshToken,
      accessToken: _accessToken,
    } = await this.appService.getAuthClientData(code);
    const redirectUrl = process.env.REDIRECT_TO_LOGIN ?? "";
    if (redirectUrl.length === 0) {
      throw new Error("REDIRECT_TO_LOGIN environment variable is not set");
    }
    return { url: redirectUrl };
  }
}
