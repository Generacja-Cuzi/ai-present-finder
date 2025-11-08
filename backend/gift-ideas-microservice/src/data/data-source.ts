import "dotenv/config";
import { DataSource } from "typeorm";

import { getDatabaseConfig } from "../config/database.config";

export const AppDataSource = new DataSource(
  getDatabaseConfig({
    migrations: ["src/data/migrations/*.ts"],
  }),
);
