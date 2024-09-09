import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';
export const fuelentry = pgTable('fuelentry', {
    fuelentryid: serial('fuelentryid').primaryKey(),
    equipmentid: integer('equipmentid').references(()=>equipment.equipmentid),
    fuel:integer('fuelconsumed'),
    litres:varchar('unit').default('Litre'),
    fueldate:varchar('consumptiondate'),
    lastmilage:integer('km_run'),
    currentmilage:integer('current_km'),
    operatorname:varchar('operatorname'),
    runninghour:integer('runninghour'),
    vendorname:varchar('vendorname'),
    username:varchar('username')
});
