import { ApiRequest } from "src/domain/models/api-request.entity";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST") ?? "localhost",
        port: configService.get("DB_PORT") ?? 5440,
        username: configService.get("DB_USERNAME") ?? "postgres",
        password: configService.get("DB_PASSWORD") ?? "postgres",
        database: configService.get("DB_NAME") ?? "restapi_macroservice",
        entities: [ApiRequest],
        synchronize: true,
        logging: true,
        migrations: ["src/database/migrations/**/*.{ts,js}"],
        migrationsTableName: "migrations",
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
