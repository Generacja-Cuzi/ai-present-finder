import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { OlxModule } from "./webapi/modules/olx.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OlxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
