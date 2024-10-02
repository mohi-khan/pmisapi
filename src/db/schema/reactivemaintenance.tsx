// schemas/reactivemaintenance.ts

import {
  integer,
  serial,
  text,
  varchar,
  jsonb,
  numeric,
  date,
  pgTable,
  boolean
} from "drizzle-orm/pg-core";

export const reactiveMaintenance = pgTable("reactivemaintenance", {
  maintenanceid: serial("maintenanceid").primaryKey(),
  equipmentid: integer("equipmentid").notNull(),
  datereported: date("datereported").notNull(),
  dateofmaintenance: date("dateofmaintenance").notNull(),
  problemdescription: text("problemdescription").notNull(),
  reportedby: integer("reportedby"),
  assignedtechnician: integer("assignedtechnician"),
  prioritylevel: varchar("prioritylevel", { length: 50 }).notNull(),
  maintenancetype: varchar("maintenancetype", { length: 50 }).notNull(),
  workperformed: text("workperformed").notNull(),
  partsused: jsonb("partsused"),
  laborhours: numeric("laborhours", { precision: 5, scale: 2 }).default("0"),
  costofparts: numeric("costofparts", { precision: 10, scale: 2 }),
  totalcost: numeric("totalcost", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull(),
  completiondate: date("completiondate"),
  comments: text("comments"),
  attachments: text("attachments").array(),
  preventivemeasures: text("preventivemeasures"),
  vendorinformation: text("vendorinformation"),
  username: varchar("username"),
  cancelled:boolean('cancelled')
});
