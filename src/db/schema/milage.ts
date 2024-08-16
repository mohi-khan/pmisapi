import {pgTable,serial,numeric,date} from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';
export const milage = pgTable('meterupdate', {
    meterupdateid: serial('meterupdateid').primaryKey(),
    equipmentid: numeric('equipmentid').references(() => equipment.equipmentid),
    milagemeter: numeric('milagemeter'),
    runninghours: numeric('runninghours'),
    date:date('date')
});

   
