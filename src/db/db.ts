import pg from 'pg';
import {drizzle} from  "drizzle-orm/node-postgres";
import dotenv from 'dotenv';
dotenv.config();
//console.log(process.env.DB_USER);
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:   +(process.env.DB_PORT ?? 3000)})
  export const db = drizzle(pool);
