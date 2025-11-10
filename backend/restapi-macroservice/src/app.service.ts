import { Injectable } from "@nestjs/common";

import { GoogleService } from "./app/services/google-service";

@Injectable()
export class AppService {
  constructor(private googleService: GoogleService) {}

  googleAuth(): { url: string } {
    return this.googleService.getOAuth2ClientUrl();
  }

  async getAuthClientData(
    code: string,
  ): Promise<{ email: string; refreshToken: string; accessToken: string }> {
    return this.googleService.getAuthClientData(code);
  }
}
