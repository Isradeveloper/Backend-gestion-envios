import { get } from 'env-var';

process.loadEnvFile();

export const envs = {
  PORT: get('PORT').default(3000).asPortNumber(),
  DB_HOST: get('DB_HOST').required().asString(),
  DB_USER: get('DB_USER').required().asString(),
  DB_PASSWORD: get('DB_PASSWORD').required().asString(),
  DB_DATABASE: get('DB_DATABASE').required().asString(),
  DB_PORT: get('DB_PORT').default(3306).asPortNumber(),
  JWT_SEED: get('JWT_SEED').required().asString(),
};
