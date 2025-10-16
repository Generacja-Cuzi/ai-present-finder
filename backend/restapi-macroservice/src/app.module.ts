import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GoogleService } from "./app/services/google-service";
import { RestApiModule } from "./webapi/modules/restapi.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RestApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleService, ConfigService],
})
export class AppModule {}
