import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AmazonModule } from "./webapi/modules/amazon.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AmazonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
