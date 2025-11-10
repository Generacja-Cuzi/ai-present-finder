import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppService } from "./app.service";
import { GoogleService } from "./app/services/google-service";
import { HealthModule } from "./webapi/modules/health.module";
import { RestApiModule } from "./webapi/modules/restapi.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RestApiModule,
    HealthModule,
  ],
  providers: [AppService, GoogleService, ConfigService],
})
export class AppModule {}
