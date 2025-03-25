import { get } from 'env-var';
import * as dotenv from 'dotenv';

dotenv.config();

export const envs = {
  PORT: get('PORT').default(3000).asPortNumber(),
  DB_URL: get('DB_URL').required().asString(),
  JWT_ACCESS_SECRET: get('JWT_ACCESS_SECRET').required().asString(),
  JWT_REFRESH_SECRET: get('JWT_REFRESH_SECRET').required().asString(),
  RESEND_API_KEY: get('RESEND_API_KEY').required().asString(),
};
