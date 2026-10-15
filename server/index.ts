import "dotenv/config";
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const app = express();
const port = Number(process.env.PORT || 3000);
const dbPath = resolve(process.env.DATABASE_PATH || "./data/smartcost.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL CHECK(amount >= 0),
  type TEXT NOT NULL DEFAULT 'house', category TEXT NOT NULL, date TEXT NOT NULL, notes TEXT,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS monthly_income (
  month TEXT PRIMARY KEY, salary REAL NOT NULL DEFAULT 0 CHECK(salary >= 0),
  bonuses REAL NOT NULL DEFAULT 0 CHECK(bonuses >= 0),
  otherIncome REAL NOT NULL DEFAULT 0 CHECK(otherIncome >= 0),
  otherIncomeNote TEXT, detailsJson TEXT, updatedAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bank_certificates (
  id TEXT PRIMARY KEY, bankName TEXT NOT NULL, certificateNumber TEXT,
  duration TEXT NOT NULL, amount REAL NOT NULL CHECK(amount > 0),
  issueDate TEXT NOT NULL, maturityDate TEXT NOT NULL, profitDate TEXT NOT NULL,
  profitAmount REAL NOT NULL DEFAULT 0 CHECK(profitAmount >= 0),
  profitFrequency TEXT NOT NULL, notes TEXT, detailsJson TEXT,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
`);

try { db.exec("ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'house'"); } catch { /* already migrated */ }
try { db.exec("ALTER TABLE monthly_income ADD COLUMN detailsJson TEXT"); } catch { /* already migrated */ }
try { db.exec("ALTER TABLE bank_certificates ADD COLUMN detailsJson TEXT"); } catch { /* already migrated */ }

app.disable("x-powered-by");
app.use(cors({ origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map(x => x.trim()) }));
app.use(express.json({ limit: "1mb" }));

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 240) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
const nonnegative = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const date = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const month = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}$/.test(v);
const now = () => new Date().toISOString();
const sendError = (res: express.Response, status: number, message: string) => res.status(status).json({ error: message });

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/expenses", (req, res) => {
  const m = req.query.month;
  if (m !== undefined && !month(m)) return sendError(res, 400, "month must be YYYY-MM");
  const rows = m ? db.prepare("SELECT * FROM expenses WHERE substr(date,1,7)=? ORDER BY date DESC").all(m) : db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
  res.json(rows);
});
app.post("/api/expenses", (req, res) => {
  const b = req.body;
  const validTypes = new Set(["house","medical","personal","student","vehicle_fuel","vehicle_maint","vehicle_oil","work"]);
  if (!isObject(b) || !text(b.title) || !nonnegative(b.amount) || !text(b.category, 80) || !date(b.date) || (b.type !== undefined && !validTypes.has(String(b.type))) || (b.notes !== undefined && typeof b.notes !== "string")) return sendError(res, 400, "invalid expense");
  const t = now(), id = typeof b.id === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(b.id) ? b.id : randomUUID();
  db.prepare("INSERT INTO expenses(id,title,amount,type,category,date,notes,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)").run(id, b.title.trim(), b.amount, String(b.type || "house"), b.category.trim(), b.date, typeof b.notes === "string" ? b.notes.slice(0,2000) : null, t, t);
  res.status(201).json(db.prepare("SELECT * FROM expenses WHERE id=?").get(id));
});
app.put("/api/expenses/:id", (req, res) => {
  const b = req.body;
  if (!isObject(b) || !text(b.title) || !nonnegative(b.amount) || !text(b.category,80) || !date(b.date) || (b.type !== undefined && !new Set(["house","medical","personal","student","vehicle_fuel","vehicle_maint","vehicle_oil","work"]).has(String(b.type))) || (b.notes !== undefined && typeof b.notes !== "string")) return sendError(res,400,"invalid expense");
  const result = db.prepare("UPDATE expenses SET title=?,amount=?,type=?,category=?,date=?,notes=?,updatedAt=? WHERE id=?").run(b.title.trim(),b.amount,String(b.type || "house"),b.category.trim(),b.date,typeof b.notes==="string"?b.notes.slice(0,2000):null,now(),req.params.id);
  if (!result.changes) return sendError(res,404,"expense not found");
  res.json(db.prepare("SELECT * FROM expenses WHERE id=?").get(req.params.id));
});
app.delete("/api/expenses/:id", (req,res) => {
  const result = db.prepare("DELETE FROM expenses WHERE id=?").run(req.params.id);
  if (!result.changes) return sendError(res,404,"expense not found");
  res.status(204).end();
});

app.get("/api/income", (_req,res) => {
  const rows=db.prepare("SELECT * FROM monthly_income ORDER BY month DESC").all() as Array<Record<string,unknown>>;
  res.json(rows.map(row=>{try{return row.detailsJson?JSON.parse(String(row.detailsJson)):row}catch{return row}}));
});
app.put("/api/income/:month", (req,res) => {
  const b=req.body, m=req.params.month;
  if (!month(m) || !isObject(b) || !nonnegative(b.salary) || !nonnegative(b.bonuses) || !nonnegative(b.otherIncome) || (b.otherIncomeNote!==undefined && typeof b.otherIncomeNote!=="string") || (b.details!==undefined&&!isObject(b.details))) return sendError(res,400,"invalid monthly income");
  db.prepare(`INSERT INTO monthly_income(month,salary,bonuses,otherIncome,otherIncomeNote,detailsJson,updatedAt) VALUES(?,?,?,?,?,?,?)
  ON CONFLICT(month) DO UPDATE SET salary=excluded.salary,bonuses=excluded.bonuses,otherIncome=excluded.otherIncome,otherIncomeNote=excluded.otherIncomeNote,detailsJson=excluded.detailsJson,updatedAt=excluded.updatedAt`).run(m,b.salary,b.bonuses,b.otherIncome,typeof b.otherIncomeNote==="string"?b.otherIncomeNote.slice(0,1000):null,b.details?JSON.stringify(b.details):null,now());
  const row=db.prepare("SELECT * FROM monthly_income WHERE month=?").get(m) as Record<string,unknown>;
  res.json(b.details||row);
});

const frequencies = new Set(["monthly","quarterly","semiannual","annual","maturity"]);
const validCertificate = (b: Record<string,unknown>) => text(b.bankName,160) && text(b.duration,100) && nonnegative(b.amount) && b.amount > 0 && date(b.issueDate) && date(b.maturityDate) && date(b.profitDate) && nonnegative(b.profitAmount) && text(b.profitFrequency,20) && frequencies.has(String(b.profitFrequency)) && (b.certificateNumber===undefined || typeof b.certificateNumber==="string") && (b.notes===undefined || typeof b.notes==="string");
app.get("/api/certificates", (_req,res) => {
 const rows=db.prepare("SELECT * FROM bank_certificates ORDER BY maturityDate").all() as Array<Record<string,unknown>>;
 res.json(rows.map(row=>{try{return row.detailsJson?JSON.parse(String(row.detailsJson)):row}catch{return row}}));
});
app.post("/api/certificates", (req,res) => {
  const b=req.body;
  if (!isObject(b) || !validCertificate(b)) return sendError(res,400,"invalid certificate");
  const id=randomUUID(), t=now();
  db.prepare("INSERT INTO bank_certificates(id,bankName,certificateNumber,duration,amount,issueDate,maturityDate,profitDate,profitAmount,profitFrequency,notes,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").run(id,String(b.bankName).trim(),typeof b.certificateNumber==="string"?b.certificateNumber.slice(0,120):null,String(b.duration).trim(),b.amount,b.issueDate,b.maturityDate,b.profitDate,b.profitAmount,String(b.profitFrequency),typeof b.notes==="string"?b.notes.slice(0,2000):null,t,t);
  res.status(201).json(db.prepare("SELECT * FROM bank_certificates WHERE id=?").get(id));
});
app.put("/api/certificates/:id", (req,res) => {
  const b=req.body;
  if (!isObject(b) || !validCertificate(b)) return sendError(res,400,"invalid certificate");
  const result=db.prepare("UPDATE bank_certificates SET bankName=?,certificateNumber=?,duration=?,amount=?,issueDate=?,maturityDate=?,profitDate=?,profitAmount=?,profitFrequency=?,notes=?,updatedAt=? WHERE id=?").run(String(b.bankName).trim(),typeof b.certificateNumber==="string"?b.certificateNumber.slice(0,120):null,String(b.duration).trim(),b.amount,b.issueDate,b.maturityDate,b.profitDate,b.profitAmount,String(b.profitFrequency),typeof b.notes==="string"?b.notes.slice(0,2000):null,now(),req.params.id);
  if (!result.changes) return sendError(res,404,"certificate not found");
  res.json(db.prepare("SELECT * FROM bank_certificates WHERE id=?").get(req.params.id));
});

app.put("/api/certificates/sync", (req,res) => {
 const b=req.body;
 if(!isObject(b)||!Array.isArray(b.items)||b.items.length>5000)return sendError(res,400,"invalid certificates payload");
 const valid=b.items.every((x:any)=>isObject(x)&&text(x.id,100)&&validCertificate({
  bankName:x.bankName,duration:x.duration,amount:x.amount,issueDate:x.issueDate,maturityDate:x.maturityDate,
  profitDate:x.profitDate,profitAmount:x.profitAmount,profitFrequency:x.profitFrequency,
  certificateNumber:x.certificateNumber,notes:x.notes
 }));
 if(!valid)return sendError(res,400,"certificate validation failed");
 const tx=db.transaction(()=>{
  db.prepare("DELETE FROM bank_certificates").run();
  const stmt=db.prepare("INSERT INTO bank_certificates(id,bankName,certificateNumber,duration,amount,issueDate,maturityDate,profitDate,profitAmount,profitFrequency,notes,detailsJson,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  for(const x of b.items as any[])stmt.run(x.id,x.bankName,x.certificateNumber??null,x.duration,x.amount,x.issueDate,x.maturityDate,x.profitDate,x.profitAmount,x.profitFrequency,x.notes??null,JSON.stringify(x),x.createdAt||now(),x.updatedAt||now());
 });
 try{tx();res.json({ok:true,count:b.items.length})}catch{sendError(res,400,"certificates could not be synced")}
});

app.delete("/api/certificates/:id", (req,res) => {
  const result=db.prepare("DELETE FROM bank_certificates WHERE id=?").run(req.params.id);
  if (!result.changes) return sendError(res,404,"certificate not found");
  res.status(204).end();
});

const backup = () => ({
  schemaVersion: 1,
  exportedAt: now(),
  expenses: db.prepare("SELECT * FROM expenses ORDER BY date").all(),
  income: db.prepare("SELECT * FROM monthly_income ORDER BY month").all(),
  certificates: db.prepare("SELECT * FROM bank_certificates ORDER BY maturityDate").all()
});
app.get("/api/backup", (_req,res) => res.json(backup()));
app.post("/api/backup/restore", (req,res) => {
  const b=req.body;
  if (!isObject(b) || b.schemaVersion!==1 || !Array.isArray(b.expenses) || !Array.isArray(b.income) || !Array.isArray(b.certificates) || b.expenses.length>10000 || b.income.length>2400 || b.certificates.length>5000) return sendError(res,400,"invalid backup format");
  const expenseValid=b.expenses.every((x:any)=>isObject(x)&&text(x.id,100)&&text(x.title)&&nonnegative(x.amount)&&text(x.category,80)&&date(x.date)&&(x.type===undefined||new Set(["house","medical","personal","student","vehicle_fuel","vehicle_maint","vehicle_oil","work"]).has(String(x.type)))&&(x.notes===null||x.notes===undefined||typeof x.notes==="string"));
  const incomeValid=b.income.every((x:any)=>isObject(x)&&month(x.month)&&nonnegative(x.salary)&&nonnegative(x.bonuses)&&nonnegative(x.otherIncome));
  const certValid=b.certificates.every((x:any)=>isObject(x)&&text(x.id,100)&&validCertificate(x));
  if (!expenseValid || !incomeValid || !certValid) return sendError(res,400,"backup validation failed");
  const restore=db.transaction(() => {
    db.prepare("DELETE FROM expenses").run(); db.prepare("DELETE FROM monthly_income").run(); db.prepare("DELETE FROM bank_certificates").run();
    const e=db.prepare("INSERT INTO expenses(id,title,amount,type,category,date,notes,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)");
    for (const x of b.expenses as any[]) e.run(x.id,x.title,x.amount,x.type||"house",x.category,x.date,x.notes??null,x.createdAt||now(),x.updatedAt||now());
    const i=db.prepare("INSERT INTO monthly_income(month,salary,bonuses,otherIncome,otherIncomeNote,updatedAt) VALUES(?,?,?,?,?,?)");
    for (const x of b.income as any[]) i.run(x.month,x.salary,x.bonuses,x.otherIncome,x.otherIncomeNote??null,x.updatedAt||now());
    const c=db.prepare("INSERT INTO bank_certificates(id,bankName,certificateNumber,duration,amount,issueDate,maturityDate,profitDate,profitAmount,profitFrequency,notes,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
    for (const x of b.certificates as any[]) c.run(x.id,x.bankName,x.certificateNumber??null,x.duration,x.amount,x.issueDate,x.maturityDate,x.profitDate,x.profitAmount,x.profitFrequency,x.notes??null,x.createdAt||now(),x.updatedAt||now());
  });
  try { restore(); res.json({ok:true,counts:{expenses:b.expenses.length,income:b.income.length,certificates:b.certificates.length}}); }
  catch { sendError(res,400,"backup could not be restored; no partial changes were kept"); }
});

// Intentionally bind to loopback by default. Add authentication before any public deployment.
app.listen(port, "127.0.0.1", () => console.log(`smartcost API listening on 127.0.0.1:${port}`));
