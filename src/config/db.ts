import mysql from 'mysql2/promise';

import { envs } from './envs';

// export const pool = mysql.createPool({
//   host: envs.DB_HOST,
//   user: envs.DB_USER,
//   password: envs.DB_PASSWORD,
//   database: envs.DB_DATABASE,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

export const pool = mysql.createPool(
  'mysql://root:kUQxBVpeZQdolRhsnpWOnGxpUYzDdROv@metro.proxy.rlwy.net:41950/gestion_envios',
);
