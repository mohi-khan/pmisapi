import {pgTable,serial,numeric,varchar} from 'drizzle-orm/pg-core';

export const employees = pgTable('employee', {
    employeeid: serial('employeeid').primaryKey(),
    employeename: varchar('employeename'),
    employeepost: varchar('employeepost', { length: 256 }),
    telno: varchar('telno', { length: 256 }),
});
