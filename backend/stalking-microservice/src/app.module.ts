import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { StalkingModule } from "./webapi/modules/stalking.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StalkingModule,
  ],
})
export class AppModule {}
