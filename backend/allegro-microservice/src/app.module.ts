import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AllegroModule } from "./webapi/modules/allegro.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AllegroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
