import mysql from 'mysql2/promise';

import { envs } from './envs';

export const pool = mysql.createPool(envs.DB_URL);
