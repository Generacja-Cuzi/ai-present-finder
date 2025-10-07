import { ChatMessage } from "src/domain/models/chat-message.entity";

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
        port: configService.get("DB_PORT") ?? 5436,
        username: configService.get("DB_USERNAME") ?? "postgres",
        password: configService.get("DB_PASSWORD") ?? "postgres",
        database: configService.get("DB_NAME") ?? "chat_microservice",
        entities: [ChatMessage],
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
