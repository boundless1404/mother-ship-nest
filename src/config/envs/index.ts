import { config } from 'dotenv';
import * as path from 'path';

export type ProcessEnv = {
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  PROJECT_NAME: string;
  SERVER_URL: string;
  SERVER_HOST: string;
  SERVER_PORT: string;
  APP_KEY: string;
  MAX_AUTH_FAILURE_BEFORE_BLACKLIST: number;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  DATABASE_URL?: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONN_POOL_COUNT: number;
  MAIL_API_KEY: string;
  MAIL_SENDER_ACCOUNT: string;
  HASH_SALT_ROUNDS: number;
  DEFAULT_USER_PASSWORD: string;
  API_ACCESS_TOKEN_EXPIRY: string;
  BREVO_API_KEY: string;
};

config({
  path: path.join(process.cwd(), '.env'),
});

export const processEnvObj = process.env as unknown as ProcessEnv;

export const JWT_SECRET = processEnvObj.JWT_SECRET;

export const MAIL_API_KEY = processEnvObj.MAIL_API_KEY;

export default processEnvObj;
