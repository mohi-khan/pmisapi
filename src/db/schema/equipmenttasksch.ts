import { integer, pgTable,serial,varchar,date } from "drizzle-orm/pg-core";
import { equipment } from "./equipment";
import { tasks } from "./tasks";
export const equipmenttasksch=pgTable('equipmenttasksch',{
    equipmenttaskschid:serial('equipmenttaskschid').primaryKey(),
    equipmentid:integer('equipmentid').references(()=>equipment.equipmentid),
    taskid:integer('taskid').references(()=>tasks.taskid),
    frequencytime:integer('frequencytime'),
    frequencytimeunit:varchar('frequencytimeunit'),
    advancenoticetime:integer('advancenoticetime'),
    lastperformed:varchar('lastperformed'),
    lastperformeh:integer('lastperformeh'),
    notes:varchar('notes'),
    status:varchar('status'),
    frequencykm:integer('frequencykm'),
    lastperformedkm:integer('lastperformedkm'),
    advanceNoticekm:integer('advanceNoticekm'),
    nextschdate:varchar('nextschdate'),
    nextschh:integer('nextschh'),
    nextschk:integer('nextschk'),
})
 
   
   
    
 