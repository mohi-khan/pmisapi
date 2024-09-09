import { pgTable, serial, integer, text, varchar,timestamp, date,jsonb,numeric,boolean } from 'drizzle-orm/pg-core';

// Define the workorder table schema
export const workorder = pgTable('workorder', {
  workorderid: serial('workorderid').primaryKey(),
  equipmentid: integer('equipmentid'),
  taskid: integer('taskid'),
  scheduledate: date('scheduledate'),
  duedate: date('duedate'),
  assignee: integer('assignee'),
  vendorid: integer('vendorid'),
  priority: varchar('priority'),
  notes: text('notes'),
  username: varchar('username'),
  created_time: timestamp('created_time'),
  status: varchar('status').default('open'),
  workstarttime: date('workstarttime'),
  workcompletiontime: date('workcompletiontime'),
  spare: jsonb('spare'),
  complitionnotes: text('complitionnotes'),
  attachment: text('attachment').array(),
  totalcost: numeric('totalcost'),
  metervalue: numeric('metervalue'),
  runninghour: numeric('runninghour'),
  procedure:text('procedure'),
  observation:text('observation'),
  cancel: boolean('cancel').default(false),
});
