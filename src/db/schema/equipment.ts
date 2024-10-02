import { bigint, date, integer, pgTable,serial, varchar,numeric } from "drizzle-orm/pg-core";
import { vendors } from "./vendor.js";
import { float } from "drizzle-orm/mysql-core/index.js";
// Define the equipment table schema
export const equipment = pgTable("equipment", {
  equipmentid: serial('equipmentid').primaryKey(),
  equipmentname:varchar('equipmentname'),
  manufacturer:varchar('manufacturer'),
  model:varchar('model'),
  serialnumber:varchar('serialnumber'),
  status:varchar('status').default('active'),
  location:varchar('location'),
  purchasedate:date('purchasedate'),
  vendorid:integer('vendorid').references(() => vendors.vendorid),
  runninghours:numeric('runninghours'),
  fuelunits:integer('fuelunits'),
  frequencyofmilageentry:integer('frequencyofmilageentry'),
  milagemeter:numeric('milagemeter'),
  username:varchar('username')
}
  )

