import {pgTable,serial,numeric,varchar} from 'drizzle-orm/pg-core';
import { employees } from './employee.js';
export const users = pgTable('users', {
    userid: serial('userid').primaryKey(),
    employeeid: numeric('employeeid').references(() => employees.employeeid),
    email: varchar('email', { length: 256 }).unique(),
    password: varchar('password', { length: 256 }),
});
