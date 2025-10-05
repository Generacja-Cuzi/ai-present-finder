import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EbayModule } from "./webapi/modules/ebay.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EbayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
