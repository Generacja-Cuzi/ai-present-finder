import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GiftEvent } from "./domain/entities/gift-event.entity";
import { GiftSession } from "./domain/entities/gift-session.entity";
import { GiftModule } from "./webapi/modules/gift.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("DATABASE_HOST") ?? "localhost",
        port: Number.parseInt(
          configService.get<string>("DATABASE_PORT") ?? "5433",
          10,
        ),
        username: configService.get<string>("DATABASE_USERNAME") ?? "gift_user",
        password:
          configService.get<string>("DATABASE_PASSWORD") ?? "gift_password",
        database: configService.get<string>("DATABASE_NAME") ?? "gift_service",
        entities: [GiftEvent, GiftSession],
        synchronize: true, // Only for development
        logging: false,
      }),
      inject: [ConfigService],
    }),
    GiftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
