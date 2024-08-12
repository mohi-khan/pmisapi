import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
export const spares = pgTable('spareparts', {
    partid: serial('partid').primaryKey(),
    partname: varchar('partname'),
    equipmentid: varchar('equipmentid').array(),
    username: varchar('username')
});
