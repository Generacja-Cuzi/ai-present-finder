import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import * as fs from "node:fs";
// eslint-disable-next-line unicorn/import-style
import { join } from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleService {
  private readonly scopesAPI: string[];
  private readonly credentialsPath: string;
  constructor(private configService: ConfigService) {
    const credentialsPathFromConfig =
      this.configService.get<string>("GOOGLE_CREDENTIALS_PATH") ?? "";
    if (credentialsPathFromConfig.length === 0) {
      throw new Error(
        "GOOGLE_CREDENTIALS_PATH is not set in the configuration",
      );
    }
    this.credentialsPath = join(process.cwd(), credentialsPathFromConfig);
    const scopesFromConfig =
      this.configService.get<string>("GOOGLE_SCOPES_API") ?? "";
    if (scopesFromConfig.length === 0) {
      throw new Error("GOOGLE_SCOPES_API is not set in the configuration");
    }
    this.scopesAPI = scopesFromConfig.split(",");
  }

  readCredentials(filePath: string): IGoogleAuthCredentials {
    const content: string = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as IGoogleAuthCredentials;
  }
  getOAuth2ClientUrl(): { url: string } {
    const authClient = this.getAuthClient();
    return this.getAuthUrl(authClient);
  }
  getAuthClient(): OAuth2Client {
    const keys: IGoogleAuthCredentials = this.readCredentials(
      this.credentialsPath,
    );
    const authClient = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0],
    );
    return authClient;
  }
  getAuthUrl(authClient: OAuth2Client): { url: string } {
    const authorizeUrl = authClient.generateAuthUrl({
      access_type: "offline",
      scope: this.scopesAPI,
      prompt: "consent",
      include_granted_scopes: true,
    });
    return { url: authorizeUrl };
  }
  async getAuthClientData(
    code: string,
  ): Promise<{ email: string; refreshToken: string; accessToken: string }> {
    const authClient = this.getAuthClient();
    const tokenData = await authClient.getToken(code);
    const tokens = tokenData.tokens;
    const refreshToken = tokens.refresh_token ?? "";
    const accessToken = tokens.access_token ?? "";

    authClient.setCredentials(tokens);

    const googleAuth = google.oauth2({
      version: "v2",
      auth: authClient,
    });

    const googleUserInfo = await googleAuth.userinfo.get();
    const email = googleUserInfo.data.email ?? "";

    if (email.length === 0) {
      throw new Error("Failed to retrieve email from Google");
    }
    if (refreshToken.length === 0) {
      throw new Error("Failed to retrieve refresh token from Google");
    }
    if (accessToken.length === 0) {
      throw new Error("Failed to retrieve access token from Google");
    }

    return { email, refreshToken, accessToken };
  }
}
export interface IGoogleAuthCredentials {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
  };
}
