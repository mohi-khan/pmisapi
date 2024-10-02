
import {pgTable,serial,varchar, integer,boolean} from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
    taskid: serial('taskid').primaryKey(),
    taskname: varchar('taskname',{length:256}),
    frequency: integer('frequency'),
    frequencyunit: varchar('frequencyunit', { enum: ["Kilo", "Running Hours","Days"] }),
    advancenotice:integer('advancenotice'),
    cancelled:boolean('cancelled')
});