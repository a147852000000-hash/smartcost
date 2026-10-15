import type { ExpenseType } from "../contracts/financeContract";
export interface CanonicalExpenseInput {
  id?:string; type:ExpenseType; title?:string; amount:number; category?:string; date:string;
  paymentMethod?:string; receiptUrl?:string; notes?:string|null; createdAt?:string;
}
async function request<T>(path:string,init?:RequestInit):Promise<T>{
 const res=await fetch(path,{...init,headers:{"Content-Type":"application/json",Accept:"application/json",...(init?.headers||{})}});
 const payload=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(String((payload as any)?.error||"تعذر تنفيذ العملية المالية."));
 return payload as T;
}
export async function getAllExpenses():Promise<Array<Record<string,unknown>>>{return request("/api/expenses")}
export async function getExpenses(query:{type?:ExpenseType|ExpenseType[];from?:string;to?:string}={}):Promise<Array<Record<string,unknown>>>{
 const rows=await getAllExpenses(),types=query.type?(Array.isArray(query.type)?query.type:[query.type]):undefined;
 return rows.filter(x=>{const type=String(x.type||"house"),date=String(x.date||"").slice(0,10);return(!types||types.includes(type as ExpenseType))&&(!query.from||date>=query.from)&&(!query.to||date<=query.to)});
}
export async function createCanonicalFinanceExpense(input:CanonicalExpenseInput):Promise<Record<string,unknown>>{
 return request("/api/expenses",{method:"POST",body:JSON.stringify({...input,title:input.title||input.category||input.type,category:input.category||input.type})});
}
export async function updateCanonicalFinanceExpense(id:string,patch:Partial<CanonicalExpenseInput>):Promise<Record<string,unknown>>{
 const rows=await getAllExpenses();
 const current=rows.find(row=>String(row.id)===id);
 if(!current)throw new Error("المصروف غير موجود.");
 const merged={...current,...patch};
 return request("/api/expenses/"+encodeURIComponent(id),{method:"PUT",body:JSON.stringify({
   id, title:String(merged.title||merged.category||merged.type||"مصروف"),
   amount:Number(merged.amount)||0, type:String(merged.type||"house"),
   category:String(merged.category||merged.type||"house"), date:String(merged.date||"").slice(0,10),
   notes:merged.notes==null?null:String(merged.notes)
 })});
}
export async function deleteCanonicalFinanceExpense(id:string):Promise<void>{
 const res=await fetch("/api/expenses/"+encodeURIComponent(id),{method:"DELETE"});
 if(!res.ok)throw new Error("تعذر حذف المصروف.");
}
export const addExpense=createCanonicalFinanceExpense;
export const financeService={getAllExpenses,getExpenses,createCanonicalFinanceExpense,addExpense,updateCanonicalFinanceExpense,deleteCanonicalFinanceExpense};
