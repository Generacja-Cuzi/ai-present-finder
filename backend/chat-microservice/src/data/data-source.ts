import "dotenv/config";
import { DataSource } from "typeorm";

import { getDatabaseConfig } from "../config/database.config";

// Data source for TypeORM CLI migrations
const dataSourceOptions = getDatabaseConfig({
  migrations: ["src/data/migrations/*.ts"],
});

export const AppDataSource = new DataSource(dataSourceOptions);
