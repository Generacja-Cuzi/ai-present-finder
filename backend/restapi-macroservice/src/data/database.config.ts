import { plainToInstance } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";
import "dotenv/config";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { Chat } from "../domain/entities/chat.entity";
import { Feedback } from "../domain/entities/feedback.entity";
import { Listing } from "../domain/entities/listing.entity";
import { Message } from "../domain/entities/message.entity";
import { UserProfile } from "../domain/entities/user-profile.entity";
import { User } from "../domain/entities/user.entity";

export const entities = [User, Chat, Listing, Message, UserProfile, Feedback];

class DatabaseEnvironmentVariables {
  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsString()
  @IsOptional()
  DATABASE_PORT = "5432";

  @IsString()
  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;
}

interface ConnectionDetails {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

function parseConnectionFromUrl(databaseUrl: string): ConnectionDetails {
  const url = new URL(databaseUrl);

  if (
    !url.hostname ||
    !url.username ||
    !url.password ||
    !url.pathname ||
    url.pathname === "/"
  ) {
    throw new Error(
      "DATABASE_URL is invalid. Must include hostname, username, password, and database name.",
    );
  }

  return {
    host: url.hostname,
    port: Number.parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  };
}

function getConnectionDetails(): ConnectionDetails {
  const config = plainToInstance(DatabaseEnvironmentVariables, process.env, {
    enableImplicitConversion: true,
  });

  // Use DATABASE_URL if provided
  if (config.DATABASE_URL !== undefined && config.DATABASE_URL.length > 0) {
    return parseConnectionFromUrl(config.DATABASE_URL);
  }

  // Otherwise validate and use individual variables
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Database configuration validation failed:\n${errors.map((error) => Object.values(error.constraints ?? {}).join(", ")).join("\n")}`,
    );
  }

  return {
    host: config.DATABASE_HOST,
    port: Number.parseInt(config.DATABASE_PORT, 10),
    username: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
  };
}

export function getDatabaseConfig(options?: {
  migrations?: string[];
  migrationsRun?: boolean;
  logging?: boolean;
}): PostgresConnectionOptions {
  const connection = getConnectionDetails();

  return {
    type: "postgres",
    ...connection,
    entities,
    migrations: options?.migrations ?? [],
    migrationsRun: options?.migrationsRun ?? false,
    synchronize: false,
    logging: options?.logging ?? false,
  };
}
