import { plainToClass } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";
import "dotenv/config";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { GiftSessionProduct } from "../domain/entities/gift-session-product.entity";
import { GiftSession } from "../domain/entities/gift-session.entity";
import { Product } from "../domain/entities/product.entity";

const entities = [GiftSession, GiftSessionProduct, Product];

/**
 * Environment variables required for database connection.
 */
class DatabaseEnvironmentVariables {
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DATABASE_HOST?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DATABASE_USERNAME?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DATABASE_NAME?: string;

  @IsOptional()
  @IsString()
  DATABASE_PORT?: string;
}

/**
 * Type for the connection details returned by getConnectionDetails.
 */
export interface ConnectionDetails {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Parse a DATABASE_URL and return connection details.
 */
function parseConnectionFromUrl(databaseUrl: string): ConnectionDetails {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number.parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  };
}

/**
 * Get validated connection details from environment.
 * Throws if required variables are missing.
 */
export function getConnectionDetails(): ConnectionDetails {
  const envVariables = plainToClass(DatabaseEnvironmentVariables, process.env, {
    enableImplicitConversion: true,
  });

  const databaseUrl = envVariables.DATABASE_URL ?? "";
  if (databaseUrl.length > 0) {
    return parseConnectionFromUrl(databaseUrl);
  }

  // Validate individual variables
  const errors = validateSync(envVariables, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Database configuration validation failed:\n${errors.map((error) => Object.values(error.constraints ?? {}).join(", ")).join("\n")}`,
    );
  }

  return {
    host: envVariables.DATABASE_HOST ?? "localhost",
    port: Number.parseInt(envVariables.DATABASE_PORT ?? "5432", 10),
    username: envVariables.DATABASE_USERNAME ?? "",
    password: envVariables.DATABASE_PASSWORD ?? "",
    database: envVariables.DATABASE_NAME ?? "",
  };
}

/**
 * Get TypeORM configuration with validated connection details.
 * synchronize is always false for safety.
 * logging is always true for visibility.
 */
export function getDatabaseConfig(options?: {
  migrations?: string[];
  migrationsRun?: boolean;
}): PostgresConnectionOptions {
  const connectionDetails = getConnectionDetails();

  return {
    type: "postgres",
    ...connectionDetails,
    entities,
    synchronize: false,
    logging: true,
    migrations: options?.migrations,
    migrationsRun: options?.migrationsRun,
  };
}
