import {pgTable,serial,numeric,integer,date, varchar} from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';

export const milage = pgTable('meterupdate', {
    meterupdateid: serial('meterupdateid').primaryKey(),
    equipmentid: integer('equipmentid').references(() => equipment.equipmentid),
    milagemeter: numeric('milagemeter'),
    runninghours: numeric('runninghours'),
    date:varchar('date'),
    fuelconsumed:numeric('fuelconsumed'),
    fuelunit:varchar('fuelunit').default('Litre')
});

   
