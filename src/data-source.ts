import "reflect-metadata";

import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { appConfig } from "./config";
import { RefreshToken } from "./entity/Refreshtoken";
import { Tenant } from "./entity/Tenantcreate";
//console.log(appConfig.DB_NAME, appConfig.DB_PORT, appConfig.DB_USERNAME);
export const AppDataSource = new DataSource({
  type: "postgres",
  host: appConfig.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: appConfig.DB_USERNAME,
  password: appConfig.DB_PASSWORD,
  database: appConfig.DB_NAME,
  synchronize: false,
  dropSchema: false,
  logging: false,
  migrations: ["src/migrations/*.{ts,js}"],
  entities: [User, RefreshToken, Tenant],
});
