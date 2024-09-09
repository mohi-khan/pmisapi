import pg from 'pg';
import {drizzle} from  "drizzle-orm/node-postgres";
import dotenv from 'dotenv';
dotenv.config();
//console.log(process.env.DB_USER);
console.log(process.env.DATABASE_URL);
const pool = new pg.Pool({
 host:process.env.HOST,
 database:process.env.DATABASE,
 user:process.env.USER,
 password:process.env.PASSWORD,
port:5432,

 })
  export const db = drizzle(pool);
