import { boolean, integer, numeric, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';
export const fuelentry = pgTable('fuelentry', {
    fuelentryid: serial('fuelentryid').primaryKey(),
    equipmentid: integer('equipmentid').references(()=>equipment.equipmentid),
    fuel:numeric('fuelconsumed'),
    litres:varchar('unit').default('Litre'),
    fueldate:varchar('consumptiondate'),
    lastmilage:integer('km_run'),
    currentmilage:integer('current_km'),
    operatorname:varchar('operatorname'),
    runninghour:integer('runninghour'),
    price:numeric('price'),
    vendorname:varchar('vendorname'),
    username:varchar('username'),
    cancelled:boolean('cancelled')
});
