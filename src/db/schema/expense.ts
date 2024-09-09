import { date, integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { equipment } from './equipment.js';
import { workorder } from './workorder.js';
import { reactiveMaintenance } from './reactivemaintenance.js';
export const expenses = pgTable('expenses', {
    id: serial('id').primaryKey(),
    created_at:timestamp('created_at'),
    created_by:varchar('created_by'),
    description:varchar('description'),
    equipmentid: integer('equipmentid').references(()=>equipment.equipmentid),
    workorderid:integer('workorderid'),
    reactivemaintenanceid:integer('reactivemaintenanceid'),
    trandate:date('trandate'),
    totalcost:integer('totalcost'),
    comments:varchar('comments')
    
});
