import { config } from "dotenv";

config();
// Read environment variables
const PORT = process.env.PORT; // <-- fixed typo
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.PORT || 3000;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWKS_URI = process.env.JWKS_URI;
const PRIVATE_KEY=process.env.PRIVATE_KEY
export const appConfig = {
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  PORT,
  JWKS_URI,
  REFRESH_TOKEN_SECRET,
  PRIVATE_KEY
};

//console.log(appConfig); // check if everything is loaded correctly
