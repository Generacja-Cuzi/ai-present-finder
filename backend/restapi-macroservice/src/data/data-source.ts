import "dotenv/config";
import { DataSource } from "typeorm";

import { getDatabaseConfig } from "./database.config";

const dataSourceOptions = getDatabaseConfig({
  migrations: ["src/data/migrations/*.ts"],
  logging: false,
});

export const AppDataSource = new DataSource(dataSourceOptions);
