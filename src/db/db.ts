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
 ssl: {
    rejectUnauthorized: true,  // Set this to false if you don't have the correct certificates
  },
 })
  export const db = drizzle(pool);
