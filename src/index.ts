import { z } from "zod";
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import {  type Context } from 'hono';
import { join } from 'path';
import { promises as fs }  from 'fs';
import { existsSync, mkdirSync,createReadStream } from 'fs';
import { cors } from 'hono/cors';
import { bearerAuth } from 'hono/bearer-auth';
import bcrypt from "bcryptjs";
import dayjs from 'dayjs';
import { ConsoleLogWriter, sql } from 'drizzle-orm' 
import {eq,ne,gt,and} from 'drizzle-orm';
import { db } from "./db/db.js";
import {users} from './db/schema/user.js';
import { employees } from './db/schema/employee.js';
import { equipment } from './db/schema/equipment.js';
import { vendors } from './db/schema/vendor.js';
import { tasks } from './db/schema/tasks.js';
import { equipmenttasksch } from './db/schema/equipmenttasksch.js';
import { workorder } from './db/schema/workorder.js';
import {spares} from './db/schema/spares.js';
import { fuelentry } from './db/schema/fuel.js';
import { reactiveMaintenance } from './db/schema/reactivemaintenance.js';
import { milage } from './db/schema/milage.js';
import { error } from 'console';
import dotenv from 'dotenv';
import { expenses } from "./db/schema/expense.js";
dotenv.config();
const app = new Hono()

if (!process.env.TOKEN) {
  throw new Error('TOKEN is not defined in the environment variables.');
}

const token = process.env.TOKEN

app.use('/api/*', bearerAuth({ token }))
app.use('*', cors());
app.post('/user',bearerAuth({ token }), async(c) => {
  const {employeeid,email,password}= await  c.req.json();
  const hashedPassword = await bcrypt.hash(password, 12);
  const user=await db.insert(users).values({employeeid:employeeid,email:email,password:hashedPassword})
  return c.json(user);
})
app.post('/vendor',bearerAuth({ token }), async(c) => {
  try{
  const {name,telno,address,username}= await  c.req.json();
  const newvendor=await db.insert(vendors).values({vendorname:name,telno:telno,address:address,username:username}).returning();
  return c.json({ success: true, data: newvendor },200);
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
 
})

app.post('/milage',bearerAuth({ token }), async(c) => {
  try{
  const {equipmentid,milagemeter,runninghours,date,fuelconsumed,fuelunit}= await  c.req.json();

  const newmilage=await db.insert(milage).values
  ({equipmentid:equipmentid,milagemeter:milagemeter,runninghours:runninghours,date:date,fuelconsumed:fuelconsumed,fuelunit:fuelunit}).returning();
  
  return c.json({ success: true, data: newmilage },200);
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
 
})
app.post('/upload', async (c) => {
  const data=await c.req.formData();
  const files:File[]=data.getAll('files') as File[] || [];
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const newnames:string[]=[];
 
  for (const file of files) {
    // Process each file here
 
  console.log(`Processing file: ${file.name}`);
  const buffer=await file.arrayBuffer();
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const newFileName = `${uniqueSuffix}-${file.name}`;
  try{
  fs.writeFile(`${uploadDir}/${newFileName}`,Buffer.from(buffer));
  newnames.push(newFileName);
  }
  catch(e)
  {
    console.log('upload error',error)
  }
    // Add your file processing logic here
  }
  return(c.json(newnames));
})
app.get('/download/:filename', async(c) => {
  const filename = c.req.param('filename');
  const filePath = join(process.cwd(), 'public', 'uploads',filename);

  if (existsSync(filePath)) {
  
    const fileContent = await fs.readFile(filePath);;
    const headers = {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/octet-stream',
    };
    return c.newResponse(fileContent, { headers });
  } else {
    return c.json({ message: 'File not found' }, 404);
  }
});


app.post('/update-workorder', async (c) => {
  const {
    workorderid,
    status,
    workstarttime,
    workcompletiontime,
    spare,
    complitionnotes,
    attachment,
    totalcost,
    metervalue,
    runninghour,
    procedure,
    observation,
    
  } = await c.req.json();
  console.log(workstarttime)
  if (!workorderid) {
    return c.json({ error: 'workorderid is required' }, 400);
  }

  const updatedFields = {
    status,
    workstarttime,
    workcompletiontime,
    spare,
    complitionnotes,
    attachment,
    totalcost,
    metervalue,
    runninghour,
    procedure,
    observation,
  };

  // Filter out undefined fields
 
  try {
    await db.update(workorder)
      .set(updatedFields)
      .where(eq(workorder.workorderid, workorderid));

    return c.json({ message: 'Workorder updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update workorder' }, 500);
  }
});

app.post('/update-equipment', async (c) => {
  const {
    equipid,
    equipname,
      manufactur,
      model,
      slno,
      vendorid,
      purdate,
      runninghour,
      milagemeter,
      username,
    
  } = await c.req.json();
 
 

  const updatedFields = {
    equipid,
    equipname,
    manufactur,
    model,
    slno,
    vendorid,
    purdate,
    runninghour,
    milagemeter,
    username
  };
  console.log(updatedFields)
  // Filter out undefined fields
 
  try {
    await db.update(equipment)
      .set(updatedFields)
      .where(eq(equipment.equipmentid, equipid));

    return c.json({ message: 'Workorder updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update Equipment' }, 500);
  }
});

  /*return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
  
    form.keepExtensions = true;

    form.parse(c.req.raw, async (err:any, fields:any, files:Files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return reject(c.json({ error: 'Failed to upload files' }, 500));
      }

      if (!files.files) {
        return reject(c.json({ error: 'No files uploaded' }, 400));
      }

      const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
      const uploadedFileNames = [];

      for (const file of uploadedFiles) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const newFileName = `${uniqueSuffix}-${file.name}`;
        const newFilePath = join(form.uploadDir, newFileName);

        try {
          await fs.rename(file.path, newFilePath);
          uploadedFileNames.push(newFileName);
        } catch (renameErr) {
          console.error('Error renaming file:', renameErr);
          return reject(c.json({ error: 'Failed to save file' }, 500));
        }
      }

      resolve(c.json({ message: 'Files uploaded successfully', filenames: uploadedFileNames }));
    }*);*/
  

  


app.post('/tasks', async(c) => {
  const {taskname,frequency,frequencyunit,advnotice}= await  c.req.json();
  const result=await db.insert(tasks).values({taskname:taskname,frequency:frequency,frequencyunit:frequencyunit,
    advancenotice:advnotice})
  return c.text('success');
})


app.post('/equipment', async(c) => {
  const {equipname,manufactur,model,slno,purdate,vendorid,runninghour,milage,username}= await  c.req.json();
  const result=await db.insert(equipment).values({equipmentname:equipname,manufacturer:manufactur,model:model,
    serialnumber:slno,purchasedate:purdate,vendorid:vendorid,runninghours:runninghour,milagemeter:milage,username:username})
  return c.text('success');
})

app.post('/tasksch', async(c) => {
  try{
  const {equipmentid,taskid,frequencytime,frequencytimeunit,advancenoticetime,
    lastperformed,lastperformeh,notes,status,frequencykm,lastperformedkm,advanceNoticekm}= await  c.req.json();
  const result=await db.insert(equipmenttasksch).values({equipmentid:equipmentid,taskid:taskid,frequencytime:frequencytime,
    frequencytimeunit:frequencytimeunit,advancenoticetime:advancenoticetime,lastperformed:(!(lastperformed)?new Date("01/01/1900"):lastperformed),lastperformeh:lastperformeh,notes:notes,
    status:status,frequencykm:frequencykm,lastperformedkm,advanceNoticekm:advanceNoticekm})
    return c.text("Insertion successful"); 
} catch (error) {
  console.error('Insertion failed:', error);
  return c.text("Insertion failed");
}
})
app.post('/workorder', async(c) => {
  const {
    equipmentid,
    taskid,
    scheduledate,
    duedate,
    assignee,
    vendorid,
    priority,
    notes,
    username
  } = await c.req.json();
  
  try {
    // Insert data into the workorder table
    const result = await db
      .insert(workorder)
      .values({
        equipmentid,
        taskid,
        scheduledate,
        duedate,
        assignee,
        vendorid,
        priority,
        notes,
        username
      })
      .returning();

    return c.json({ success: true, data: result },200);
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
});
app.post('/spareadd', async(c) => {
  const {
    spareName,
    equipids,
    username,
  } = await c.req.json();
  
  try {
    // Insert data into the workorder table
    const result = await db
      .insert(spares)
      .values({
        partname:spareName,
        equipmentid:equipids,
        username:username
      })
      .returning();

    return c.json({ success: true, data: result },200);
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
});
app.post('/fuelentry', async(c) => {
  const {
    equipmentid,
    fuel,
    litres,
    fueldate,
    lastmilage,
    currentmilage,
    operatorname,
    runninghour,
    username
  } = await c.req.json();
  
  try {
    // Insert data into the workorder table
    const result = await db
      .insert(fuelentry)
      .values({
        equipmentid:equipmentid,
        fuel,
        fueldate,
        lastmilage,
        currentmilage,
        operatorname,
        runninghour,
        username
      })
      .returning();

    return c.json({ success: true, data: result },200);
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
});
app.post('/reactivemaintenance', async (c) => {
  try {
    const {
      equipmentid,
      equipmentname,
      datereported,
      dateofmaintenance,
      problemdescription,
      reportedby,
      assignedtechnician,
      prioritylevel,
      maintenancetype,
      workperformed,
      partsused,
      laborhours,
      costofparts,
      totalcost,
      status,
      completiondate,
      comments,
      attachments,
      nextscheduledmaintenance,
      preventivemeasures,
      equipmentlocation,
      warrantyinformation,
      vendorinformation,
      username,
    } = await c.req.json();

    const result = await db.insert(reactiveMaintenance).values({
      equipmentid,
      datereported,
      dateofmaintenance,
      problemdescription,
      reportedby,
      assignedtechnician,
      prioritylevel,
      maintenancetype,
      workperformed,
      partsused,
      laborhours,
      costofparts,
      totalcost,
      status,
      completiondate,
      comments,
      attachments,
      preventivemeasures,
      vendorinformation,
      username,
    }).returning();

    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to store data' }, 500);
  }
});


app.get('/userdetails/:email',async(c) => {
  const email=  c.req.param('email');
  const user=await db.select().from(users).where(eq(users.email,email))
  return c.json(user);
})
app.get('/equipmentsId',async(c) =>{
  interface row{
    id:number
  }
  const equipment_id=await db.select({
    id:equipment.equipmentid
    }).from(equipment);
      const equpimentid = equipment_id.map((row:row) => row.id);
      return c.json(equpimentid);
})
app.get('/equipments',async(c) => {
  const myequipment=await db.select({
  id:equipment.equipmentid,
  name: equipment.equipmentname,
  model:equipment.model,
  runninghour:equipment.runninghours,
  milagemeter:equipment.milagemeter,

  }).from(equipment);
  //To format BigInt as it is not supported toJson
  const formattedEquipment = myequipment.map(item => ({
    ...item,
      milagemeter: item.milagemeter ? item.milagemeter.toString() : null,
  }));
    return c.json(formattedEquipment);
})
app.get('/spare/:equipid',async(c)=>{
  const equipmentId = c.req.param('equipid');

  try {
    // Query to find spare parts with the specified equipment ID
    const spareParts = await db.execute(sql`
      SELECT partid,partname
      FROM spareparts
      WHERE ${equipmentId} = ANY (equipmentid)
    `);

    return c.json(spareParts.rows);
  } catch (error) {
    console.error('Error querying spare parts:', error);
    return c.json({ error: 'Error querying spare parts' }, 500);
  }
})
app.get('/spareWithEquipments/:equipmentid',async(c)=>{
const id=parseInt(c.req.param('equipmentid'));
const sparelist=await db.execute(sql`SELECT 
    sp.partname,
    wo.workcompletiontime
FROM 
    public.spareparts sp
LEFT JOIN 
    public.workorder wo ON (wo.spare @> jsonb_build_array(jsonb_build_object('code', sp.partid))::jsonb)
WHERE 
   ${id} = any(sp.equipmentid) `)
   return c.json(sparelist.rows);
})

app.get('/equipments/:id',async(c) => {
  const id=parseInt(c.req.param('id'))
  const myequipment=await db.select({
  id:equipment.equipmentid,
  name: equipment.equipmentname,
  model:equipment.model,
  manufacturur:equipment.manufacturer,
  serial:equipment.serialnumber,
  status:equipment.status,
  location:equipment.location,
  purchasedate:equipment.purchasedate,
  runninghour:equipment.runninghours,
  milagemeter:equipment.milagemeter,
  vendor:equipment.vendorid
  }).from(equipment).where(eq(equipment.equipmentid,id));
  //To format BigInt as it is not supported toJson
  const formattedEquipment = myequipment.map(item => ({
    ...item,
      milagemeter: item.milagemeter ? item.milagemeter.toString() : null,
  }));
    return c.json(formattedEquipment);
})
app.get('/equipmentMasterList',async(c) => {
  const myequipment=await db.select({
  id:equipment.equipmentid,
  name: equipment.equipmentname ,
  model:equipment.model,

  }).from(equipment);
  const formattedEquipment = myequipment.map(item => ({
    id: item.id,
    desc: item.name + "/" + item.model
  }));
  return c.json(formattedEquipment);
});


app.get('/manufactururlist',async(c)=>{
  const manufactururs=await db.selectDistinct({
    name:equipment.manufacturer
  }).from(equipment);
  return c.json(manufactururs);
})
app.get('/tasklist',async(c)=>{
  const tasklist=await db.select({
    id:tasks.taskid,
    name:tasks.taskname
  }).from(tasks);
  return c.json(tasklist);
})
app.get('/vendors',async(c)=>{
  const vendorlist=await db.select({
    id:vendors.vendorid,
    name:vendors.vendorname
  }).from(vendors);
  return c.json(vendorlist);
})
app.get('/employees',async(c)=>{
  const employeelist=await db.select({
    id:employees.employeeid,
    name:employees.employeename
  }).from(employees);
  return c.json(employeelist);
})
app.get('/tasks',async(c)=>{
  const tasklist=await db.select({
    id:tasks.taskid,  
    name:tasks.taskname,
    frequency:tasks.frequency,
    frequnit:tasks.frequencyunit,
    advnotice:tasks.advancenotice
  }).from(tasks);
  return c.json(tasklist);
})
app.get('/fuelhistory/:equipmentid',async(c)=>{
  const equipid=parseInt(c.req.param('equipmentid'))
  const fuelhistory=await db.select({
    fueldate:fuelentry.fueldate,
    fuelqty:fuelentry.fuel,
    fuelunit:fuelentry.litres,
    lastmilage:fuelentry.lastmilage,
    currentmilage:fuelentry.currentmilage,
    runninghour:fuelentry.runninghour,
    vendorname:fuelentry.vendorname}).from(fuelentry).where (eq(fuelentry.equipmentid,equipid));
    return c.json(fuelhistory);
  })
  app.get('/fuelreports/:equipmentid/:formdate/:enddate',async(c)=>{
    const id=parseInt(c.req.param('equipmentid'));
    const fdate=c.req.param('formdate');
    const edate=c.req.param('enddate');
    const fuelhistory=await db.execute(sql`SELECT 
    e.equipmentid,
    e.equipmentname,
    e.model,
    m.milagemeter,
    m.runninghours,
    m.fuelconsumed,
    m.date,
    CASE 
        WHEN m.milagemeter IS NOT NULL AND m.fuelconsumed > 0 THEN 
            m.milagemeter / m.fuelconsumed 
        ELSE 
            NULL 
    END AS mileage_per_liter,
    CASE 
        WHEN m.runninghours IS NOT NULL AND m.fuelconsumed > 0 THEN 
            m.runninghours / m.fuelconsumed
        ELSE 
            NULL 
    END AS running_hours_per_liter
FROM 
    equipment e
LEFT JOIN 
    meterupdate m ON e.equipmentid = m.equipmentid

where m.equipmentid=${id} and date between ${fdate} and ${edate}`)
     
       return c.json(fuelhistory.rows);
    })
    app.get('/workorderhistory/:equipmentid',async(c)=>{
    const equipid=parseInt(c.req.param('equipmentid'))
    const workorderhistory=await db.select({
      workorderid:workorder.workorderid,
      taskname:tasks.taskname,
      scheduledate:workorder.scheduledate,
      assigneename:employees.employeename,
      vendorname:vendors.vendorname,
      notes:workorder.notes,
      status:workorder.status,
      workstarttime:workorder.workstarttime,
      workcompletiontime: workorder.workcompletiontime,
      spare: workorder.spare,
      completionnotes:workorder.complitionnotes,
      attachments: workorder.attachment,
      totalcost: workorder.totalcost,
      metervalue: workorder.metervalue,
      runninghour: workorder.runninghour,
      }).from(workorder).leftJoin(vendors,eq(workorder.vendorid,vendors.vendorid)).
      leftJoin(employees,eq(workorder.assignee,employees.employeeid)).
      leftJoin(equipmenttasksch,eq(workorder.taskid,equipmenttasksch.equipmenttaskschid)).
      leftJoin(tasks,eq(equipmenttasksch.taskid,tasks.taskid)).where (eq(workorder.equipmentid,equipid));
      console.log(workorderhistory);
      return c.json(workorderhistory);
    })
    app.get('/reactivehistory/:equipmentid',async(c)=>{
      const equipid=parseInt(c.req.param('equipmentid'))
      const reactivehistory=await db.select({
  datereported: reactiveMaintenance.datereported,
  dateofmaintenance: reactiveMaintenance.dateofmaintenance,
  problemdescription: reactiveMaintenance.problemdescription,
  reportedby:reactiveMaintenance.reportedby,
  asssigtechnician: reactiveMaintenance.assignedtechnician,
  maintenancetype: reactiveMaintenance.maintenancetype,
  workperformed: reactiveMaintenance.workperformed,
  partused: reactiveMaintenance.partsused,
  laborhours:reactiveMaintenance.laborhours,
  costofparts: reactiveMaintenance.costofparts,
  completiondate:reactiveMaintenance.completiondate,
  comments: reactiveMaintenance.comments,
  preventivemeasures:reactiveMaintenance.preventivemeasures,
  vendorinformation: reactiveMaintenance.vendorinformation,
  attachments: reactiveMaintenance.attachments,
  }).from(reactiveMaintenance).where (eq(reactiveMaintenance.equipmentid,equipid));
      return(c.json(reactivehistory))
    })
    app.get('/expensehistory/:equipmentid',async(c)=>{
      const equipid=parseInt(c.req.param('equipmentid'))
      const expensehistory=await db.select({
      description:expenses.description,
      equipmentdesc:equipment.equipmentname,
      workerid:expenses.workorderid,
      reactivemaintenanceid:expenses.reactivemaintenanceid,
      trandate:expenses.trandate,
      totalcost:expenses.totalcost,
      comment:expenses.comments,
      }).from(expenses).leftJoin(equipment,eq(expenses.equipmentid,equipment.equipmentid))
      .where (eq(expenses.equipmentid,equipid));
      
        return c.json(expensehistory);
      })
      app.get('/milagehistory/:equipmentid',async(c)=>{
        const equipid=parseInt(c.req.param('equipmentid'),10)
        const milagehistory=await db.select({
        equipmentname:equipment.equipmentname,
        model:equipment.model,
        milage:milage.milagemeter,
        runninghour:milage.runninghours,
        trandate:milage.date,
        fuelconsumed:milage.fuelconsumed,
        fuelunit:milage.fuelunit
        }).from(milage).leftJoin(equipment,eq(milage.equipmentid,equipment.equipmentid))
        .where (eq(milage.equipmentid,equipid));
        
          return c.json(milagehistory);
        })
app.get('/workorders',async(c)=>{
  const wolist=await db.select({
    id:workorder.workorderid,
    equipmentid:equipment.equipmentid,
    equipmentname:equipment.equipmentname,
    equipmentmodel:equipment.model,
    task:tasks.taskname,
    assignee:employees.employeename,
    vendors:vendors.vendorname,
    scheduledate:workorder.scheduledate,
    duedate:workorder.duedate,
    notes:workorder.notes,
    priority:workorder.priority
  }).from(workorder).
  leftJoin(equipment,eq(workorder.equipmentid,equipment.equipmentid)).
  leftJoin(equipmenttasksch,eq(workorder.taskid,equipmenttasksch.equipmenttaskschid)).
  leftJoin(tasks,eq(equipmenttasksch.taskid,tasks.taskid)).
  leftJoin(employees,eq(workorder.assignee,employees.employeeid)).
  leftJoin(vendors,eq(workorder.vendorid,vendors.vendorid)).
  where(ne(workorder.status,"completed"));
  return c.json(wolist);
})
app.get('/tasksch/:equipmentid',async(c)=>{
  const equipid=parseInt(c.req.param('equipmentid'))
  const tasklist=await db.execute(sql`SELECT
  et.equipmenttaskschid as schid,
  et.taskid as id,
  tk.taskname as name,
  et.frequencytime as freqt,
  et.frequencytimeunit as frequ,
  et.advancenoticetime as advnott,
  et.lastperformed as lastperford,
  et.status AS task_status,
  et.frequencykm as freqkm,
  et.lastperformedkm as lastperformkm,
  et."advanceNoticekm" as advnotkm,
  et.lastperformeh as lastperformh,
  CASE
    WHEN et.nextschdate IS NOT NULL THEN
      CASE
        WHEN et.nextschdate < CURRENT_DATE THEN
          CONCAT(ABS(et.nextschdate - CURRENT_DATE), ' days ago')
        WHEN et.nextschdate > CURRENT_DATE THEN
          CONCAT(et.nextschdate - CURRENT_DATE, ' days after')
        ELSE
          'today'
      END
    WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 THEN
      CASE
        WHEN et.nextschh < eq.runninghours THEN
          CONCAT(ABS(et.nextschh - eq.runninghours), ' hours ago')
        WHEN et.nextschh > eq.runninghours THEN
          CONCAT(et.nextschh - eq.runninghours, ' hours after')
        ELSE
          'now'
      END
    WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 THEN
      CASE
        WHEN et.nextschk < eq.milagemeter THEN
          CONCAT(ABS(et.nextschk - eq.milagemeter), ' km ago')
        WHEN et.nextschk > eq.milagemeter THEN
          CONCAT(et.nextschk - eq.milagemeter, ' km after')
        ELSE
          'now'
      END
    ELSE
      'No scheduled date'
  END AS status
FROM
  public.equipmenttasksch et
  JOIN public.equipment eq ON et.equipmentid = eq.equipmentid
  Join public.tasks tk ON et.taskId=tk.taskId
  where et.equipmentid=${equipid}`)
  return c.json(tasklist);
})


app.get('/getoverdue',async(c)=>{
   const overdue=await db.execute(sql`SELECT
				et.equipmentid,
        SUM(CASE
                WHEN et.frequencytimeunit = 'days' AND et.nextschdate < CURRENT_DATE THEN 1
                WHEN et.frequencytimeunit <> 'days' AND et.nextschh > 0 AND et.nextschh < eq.runninghours THEN 1
                WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk < eq.milagemeter THEN 1
                ELSE 0
            END) AS overdue_count,
        SUM(CASE
                WHEN et.nextschdate IS NOT NULL AND et.nextschdate <= (CURRENT_DATE + et.advancenoticetime) AND et.nextschdate > CURRENT_DATE THEN 1
                WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 AND  et.nextschh <= (eq.runninghours + et.advancenoticetime) AND et.nextschh > eq.runninghours THEN 1
                WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND  et.nextschk <= (eq.milagemeter + et."advanceNoticekm") AND et.nextschk > eq.milagemeter THEN 1
                ELSE 0
            END) AS advance_notice_count
    FROM
        public.equipmenttasksch et
    JOIN
        public.equipment eq ON et.equipmentid = eq.equipmentid
    GROUP BY et.equipmentid`)
  return c.json(overdue);
})
app.get('/notification',async(c)=>{
  const overdue=await db.execute(sql`SELECT
    et.equipmenttaskschid,
    et.equipmentid,
    eq.equipmentname,
    eq.model,
    tk.taskname,
    et."WoStatus"  as woStatus,
    CASE
    WHEN et.nextschdate IS NOT NULL THEN
      CASE
        WHEN et.nextschdate < CURRENT_DATE THEN
          CONCAT(ABS(et.nextschdate - CURRENT_DATE), ' days ago')
        WHEN et.nextschdate > CURRENT_DATE THEN
          CONCAT(et.nextschdate - CURRENT_DATE, ' days after')
        ELSE
          'today'
      END
    WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 THEN
      CASE
        WHEN et.nextschh < eq.runninghours THEN
          CONCAT(ABS(et.nextschh - eq.runninghours), ' hours ago')
        WHEN et.nextschh > eq.runninghours THEN
          CONCAT(et.nextschh - eq.runninghours, ' hours after')
        ELSE
          'now'
      END
    WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 THEN
      CASE
        WHEN et.nextschk < eq.milagemeter THEN
          CONCAT(ABS(et.nextschk - eq.milagemeter), ' km ago')
        WHEN et.nextschk > eq.milagemeter THEN
          CONCAT(et.nextschk - eq.milagemeter, ' km after')
        ELSE
          'now'
      END
    ELSE
      'No scheduled date'
  END AS status,
    CASE
        WHEN et.nextschdate IS NOT NULL AND et.nextschdate < CURRENT_DATE THEN 'Overdue'
        WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh < eq.runninghours THEN 'Overdue'
        WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk < eq.milagemeter THEN 'Overdue'
        WHEN et.nextschdate IS NOT NULL AND et.nextschdate <= (CURRENT_DATE + et.advancenoticetime * interval '1 day') THEN 'Advance Notice'
        WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh <= (eq.runninghours + et.advancenoticetime) THEN 'Advance Notice'
        WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk <= (eq.milagemeter + et."advanceNoticekm") THEN 'Advance Notice'
        ELSE 'On Time'
    END AS noticestatus
FROM
    public.equipmenttasksch et
JOIN
    public.equipment eq ON et.equipmentid = eq.equipmentid
JOIN
    public.tasks tk ON et.taskid = tk.taskid
WHERE
    (et.nextschdate IS NOT NULL AND et.nextschdate < CURRENT_DATE)
    OR (et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh < eq.runninghours)
    OR (et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk < eq.milagemeter)
    OR (et.nextschdate IS NOT NULL AND et.nextschdate <= (CURRENT_DATE + et.advancenoticetime * interval '1 day'))
    OR (et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh <= (eq.runninghours + et.advancenoticetime))
    OR (et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk <= (eq.milagemeter + et."advanceNoticekm"));`)
 return c.json(overdue.rows);
})
app.get('/notificationcount',async(c)=>{
  const myResultSchema = z.object({
    count: z.number(),
    status: z.string(),
  });
  
  type MyResult = z.infer<typeof myResultSchema>; // Optional, to infer the TypeScript type
 try{ 
  // Assume 'overdue' is the result from your database query
  const overdue = await db.execute(sql`
    SELECT count(*)::int as count,
      CASE
          WHEN et.nextschdate IS NOT NULL AND et.nextschdate < CURRENT_DATE THEN 'Overdue'
          WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh < eq.runninghours THEN 'Overdue'
          WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk < eq.milagemeter THEN 'Overdue'
          WHEN et.nextschdate IS NOT NULL AND et.nextschdate <= (CURRENT_DATE + et.advancenoticetime * interval '1 day') THEN 'Advance Notice'
          WHEN et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh <= (eq.runninghours + et.advancenoticetime) THEN 'Advance Notice'
          WHEN et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk <= (eq.milagemeter + et."advanceNoticekm") THEN 'Advance Notice'
          ELSE 'On Time'
      END AS noticestatus
    FROM public.equipmenttasksch et
    JOIN public.equipment eq ON et.equipmentid = eq.equipmentid
    JOIN public.tasks tk ON et.taskid = tk.taskid
    WHERE 
      (et.nextschdate IS NOT NULL AND et.nextschdate < CURRENT_DATE)
      OR (et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh < eq.runninghours)
      OR (et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk < eq.milagemeter)
      OR (et.nextschdate IS NOT NULL AND et.nextschdate <= (CURRENT_DATE + et.advancenoticetime * interval '1 day'))
      OR (et.nextschh IS NOT NULL AND et.nextschh > 0 AND et.nextschh <= (eq.runninghours + et.advancenoticetime))
      OR (et.nextschk IS NOT NULL AND et.nextschk > 0 AND et.nextschk <= (eq.milagemeter + et."advanceNoticekm"))
    GROUP BY noticestatus
  `);
  
  const results: MyResult[] = overdue.rows.map((row: any) => {
    const parsedRow = myResultSchema.parse({
      count: row.count,
      status: row.noticestatus,
    });
    return parsedRow;
  });

  const messageParts = results.map((result) => {
    const status = result.status;
    const count = result.count;
    const plural = count > 1 ? 's' : '';
    return `${count} ${status}${plural}`;
  });

  const finalMessage = `There are ${messageParts.join(' and ')}`;

  return c.json({ status: 'success', message: finalMessage });
} catch (error:any) {
  return c.json({ status: 'error', message: error.message }, 500);
}
})
app.get('/sparedetails',async(c)=>{
  const SparePartSchema = z.object({
    part_code: z.number(),
    spare_part_name: z.string(),
    equipment_id: z.number(),
    equipment_name: z.string(),
    equipment_model: z.string(),
  });
  
  // Define types using Zod schemas
  type SparePart = z.infer<typeof SparePartSchema>;
  interface parts{
    part_code:number,
    partname: string; 
    equipment_id:number[];
    equipmentdesc: string[] 
  }

  const result=await db.execute(sql`SELECT s.partid as part_code,s.partname AS spare_part_name,
    e.equipmentid AS equipment_id,
    e.equipmentname AS equipment_name, e.model AS equipment_model FROM
    spareparts s,unnest(s.equipmentid) AS equipment_id_array(eid) JOIN
    equipment e ON e.equipmentid = eid::integer`) 
    const parsedRows = z.array(SparePartSchema).parse(result.rows);

    const formattedParts: parts[] = parsedRows.reduce((acc:parts[], part:SparePart) => {
      // Check if the partname already exists in acc
      const existingPart = acc.find((item) => item.part_code === part.part_code);
  
      if (existingPart) {
        // Add equipment description to existing part
        existingPart.equipment_id.push(part.equipment_id);
        existingPart.equipmentdesc.push(`${part.equipment_name}/${part.equipment_model}`);
      } else {
        // Create a new part entry
       
        acc.push({
          part_code:part.part_code,
          partname: part.spare_part_name,
          equipment_id:[part.equipment_id],
          equipmentdesc: [`${part.equipment_name}/${part.equipment_model}`],
        });
      }
  
      return acc;
    }, []  as parts[]);  // Corrected accumulator type
  
    return c.json(formattedParts);
})
app.get('/tasklist/:equipid',async(c)=>{
  const equipid = parseInt(c.req.param('equipid'));
 
  // Query using Drizzle ORM
  const result = await db.select({  
    id:workorder.workorderid,
    taskname:tasks.taskname
  }).from(workorder)
  .leftJoin(equipmenttasksch,eq(workorder.taskid,equipmenttasksch.equipmenttaskschid))
  .leftJoin(tasks,eq(equipmenttasksch.taskid,tasks.taskid))
  .where(eq(workorder.equipmentid, equipid))
      
   
      return c.json(result);
 
  });
  app.get('/maintenancelist/:equipid',async(c)=>{
    const equipid = parseInt(c.req.param('equipid'));
   
    // Query using Drizzle ORM
    const result = await db.select({  
      id:reactiveMaintenance.maintenanceid,
      description:reactiveMaintenance.problemdescription
    }).from(reactiveMaintenance)
    .where(eq(reactiveMaintenance.equipmentid, equipid))
        
     
        return c.json(result);
   
    });
  app.get('/workorderdet/:workorderid',async(c)=>{
    const wid = parseInt(c.req.param('workorderid'));
   
    // Query using Drizzle ORM
    const result = await db.select({  
      id:workorder.workorderid,
      taskname:tasks.taskname,
      completedate:workorder.workcompletiontime,
      name:employees.employeename,
      position:employees.employeepost,
      tel:employees.telno,
      problem:workorder.notes,
      spares:workorder.spare,
      procedure:workorder.procedure,
      observation:workorder.observation,  
      attachment:workorder.attachment                                                      
    }).from(workorder)
    .leftJoin(equipmenttasksch,eq(workorder.taskid,equipmenttasksch.equipmenttaskschid))
    .leftJoin(tasks,eq(equipmenttasksch.taskid,tasks.taskid))
    .leftJoin(employees,eq(workorder.assignee,employees.employeeid))    
    .where(eq(workorder.workorderid, wid))
        
     
        return c.json(result);
   
    });
    app.get('/maintenancedet/:maintenanceid',async(c)=>{
      const mid = parseInt(c.req.param('maintenanceid'));
     
      // Query using Drizzle ORM
      const result = await db.select({  
        id:reactiveMaintenance.maintenanceid,
        taskname:reactiveMaintenance.problemdescription,
        completedate:reactiveMaintenance.completiondate,
        name:employees.employeename,
        position:employees.employeepost,
        tel:employees.telno,
        problem:reactiveMaintenance.problemdescription,
        spares:reactiveMaintenance.partsused,
        procedure:reactiveMaintenance.workperformed,
        observation:reactiveMaintenance.preventivemeasures,  
        attachment:reactiveMaintenance.attachments                                                      
      }).from(reactiveMaintenance)
      .leftJoin(employees,eq(reactiveMaintenance.assignedtechnician,employees.employeeid))    
      .where(eq(reactiveMaintenance.maintenanceid, mid))
          
       
          return c.json(result);
     
      });
app.get('/equipcost/:equipid/month/:month',async(c)=>{
  const equipid = parseInt(c.req.param('equipid'));
  const month = parseInt(c.req.param('month'),10);
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() - month);
  const targetDateString = targetDate.toISOString().split('T')[0];
  // Query using Drizzle ORM
  const result = await db
      .select({
          total_cost: sql<number>`SUM(${expenses.totalcost})`,
      })
      .from(expenses)
      .where(and(eq(expenses.equipmentid, equipid),gt(expenses.trandate,targetDateString)))
      
     const totalCost = result.length > 0 && result[0] ? result[0].total_cost : 0;
    return c.json({ totalCost });
 
  });
  app.get('/monthly-total-cost/:equipid', async (c) => {
    try {
        const equipid = parseInt(c.req.param('equipid'));
        const sixMonthsAgo = dayjs().subtract(6, 'month').startOf('month').toDate();
        const currentMonth = dayjs().startOf('month').toDate();

        const results = await db.execute(sql`
          SELECT 
              date_trunc('month', trandate) AS month, 
              SUM(totalcost) AS total_cost 
          FROM public.expenses 
          WHERE trandate >= ${sixMonthsAgo} and equipmentid=${equipid} 
          GROUP BY date_trunc('month', trandate) 
          ORDER BY date_trunc('month', trandate)`)

        // Prepare the response with the last 6 months data
        const months = [];
        const costs = [];

        for (let i = 5; i >= 0; i--) {
            const month = dayjs().subtract(i, 'month').startOf('month').format('YYYY-MM');
            const result = results.rows.find((r: any) => dayjs(r.month).format('YYYY-MM') === month);
            months.push(month);
            costs.push(result ? result.total_cost : 0);
        }

        return c.json({ months, costs });
    } catch (error) {
        console.error('Error fetching monthly total costs:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

const port =  +(process.env.PORT ?? 8779)
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
