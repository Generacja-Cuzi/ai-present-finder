import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { GoogleAuthUrlDto } from "../../domain/models/auth.dto";

@Injectable()
export class GoogleService {
  private readonly scopesAPI: string[];
  private readonly credentials: IGoogleAuthCredentials;

  constructor(private configService: ConfigService) {
    const credentialsBase64FromConfig =
      this.configService.get<string>("GOOGLE_CREDENTIALS_BASE64") ?? "";
    if (credentialsBase64FromConfig.length === 0) {
      throw new Error(
        "GOOGLE_CREDENTIALS_BASE64 is not set in the configuration",
      );
    }

    try {
      const credentialsJson = Buffer.from(
        credentialsBase64FromConfig,
        "base64",
      ).toString("utf8");
      this.credentials = JSON.parse(credentialsJson) as IGoogleAuthCredentials;
    } catch {
      throw new Error(
        "GOOGLE_CREDENTIALS_BASE64 is not valid base64 or JSON in the configuration",
      );
    }

    const scopesFromConfig =
      this.configService.get<string>("GOOGLE_SCOPES_API") ?? "";
    if (scopesFromConfig.length === 0) {
      throw new Error("GOOGLE_SCOPES_API is not set in the configuration");
    }
    this.scopesAPI = scopesFromConfig.split(",");
  }

  getOAuth2ClientUrl(): GoogleAuthUrlDto {
    const authClient = this.getAuthClient();
    return this.getAuthUrl(authClient);
  }

  getAuthClient(): OAuth2Client {
    const authClient = new OAuth2Client(
      this.credentials.web.client_id,
      this.credentials.web.client_secret,
      this.credentials.web.redirect_uris[0],
    );
    return authClient;
  }
  getAuthUrl(authClient: OAuth2Client): GoogleAuthUrlDto {
    const authorizeUrl = authClient.generateAuthUrl({
      access_type: "offline",
      scope: this.scopesAPI,
      prompt: "consent",
      include_granted_scopes: true,
    });
    return { url: authorizeUrl };
  }
  async getAuthClientData(code: string): Promise<{
    email: string;
    refreshToken: string;
    accessToken: string;
    givenName: string;
    familyName: string;
    picture: string;
  }> {
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
    const givenName = googleUserInfo.data.given_name ?? "";
    const familyName = googleUserInfo.data.family_name ?? "";
    const picture = googleUserInfo.data.picture ?? "";

    if (email.length === 0) {
      throw new Error("Failed to retrieve email from Google");
    }
    if (refreshToken.length === 0) {
      throw new Error("Failed to retrieve refresh token from Google");
    }
    if (accessToken.length === 0) {
      throw new Error("Failed to retrieve access token from Google");
    }

    return { email, refreshToken, accessToken, givenName, familyName, picture };
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
