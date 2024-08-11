import {pgTable,serial,varchar} from 'drizzle-orm/pg-core';

export const vendors = pgTable('vendor', {
    vendorid: serial('vendorid').primaryKey(),
    vendorname: varchar('vendorname',{length:256}),
    telno: varchar('telno', { length: 55 }),
    address: varchar('address', { length: 256 }),
    username:varchar('username'),
});