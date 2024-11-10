import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Company } from "../entities/Company";
import { Patent } from "../entities/Patent";
import { PatentCompanyComparison } from "../entities/PatentCompanyComparison";
import { Product } from "../entities/Product";
import { UserComparison } from "../entities/UserComparison";
import { UserAccessToken } from "../entities/UserAccessToken";

require("dotenv").config();

const { DB_MYSQL_HOST, DB_MYSQL_PORT, DB_MYSQL_USERNAME, DB_MYSQL_PASSWORD, DB_MYSQL_DATABASE, } = process.env;
console.log( "TYPE_ORM_MYSQL_ENV:" + DB_MYSQL_HOST, DB_MYSQL_PORT, DB_MYSQL_USERNAME, DB_MYSQL_PASSWORD, DB_MYSQL_DATABASE );

export const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_MYSQL_HOST,
  port: Number(DB_MYSQL_PORT),
  username: DB_MYSQL_USERNAME,
  password: DB_MYSQL_PASSWORD,
  database: DB_MYSQL_DATABASE,
  charset: "utf8mb4",
  synchronize: true,
  logging: false,
  entities: [
    Company,
    Patent,
    PatentCompanyComparison,
    Product,
    User,
    UserAccessToken,
    UserComparison
  ],
  subscribers: [],
  migrations: [],
});
