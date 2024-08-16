import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';
export const fuelentry = pgTable('fuelentry', {
    fuelentryid: serial('fuelentryid').primaryKey(),
    equipmentid: integer('equipmentid').references(()=>equipment.equipmentid),
    fuel:integer('fuel'),
    litres:varchar('litres').default('Litre'),
    fueldate:varchar('fueldate'),
    lastmilage:integer('lastmilage'),
    currentmilage:integer('currentmilage'),
    operatorname:varchar('operatorname'),
    runninghour:integer('runninghour'),
    vendorname:varchar('vendorname'),
    username:varchar('username')
});
