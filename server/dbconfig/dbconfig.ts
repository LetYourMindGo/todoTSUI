import { Pool } from 'pg';
import { config } from 'dotenv';

config();

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT),
    max: Number(process.env.DB_MAX)
});
