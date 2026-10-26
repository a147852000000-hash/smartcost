import { useState } from "react";
import { ExpensesView } from "./components/ExpensesView";
import { IncomeCertificatesView } from "./components/IncomeCertificatesView";
import type { Language } from "./types";

export function FinanceApp() {
  const [language,setLanguage]=useState<Language>("ar");
  const [currency,setCurrency]=useState("EGP");
  const [theme,setTheme]=useState<"light"|"dark">("dark");
  const [screen,setScreen]=useState<"expenses"|"income">("expenses");
  const [backupNotice,setBackupNotice]=useState("");
  const [backupError,setBackupError]=useState("");
  const exportFinanceBackup=async()=>{
    try{
      const response=await fetch("/api/backup");
      if(!response.ok)throw new Error("تعذر تصدير النسخة المالية");
      const data=await response.json();
      const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
      const link=document.createElement("a");link.href=url;link.download="smartcost-finance-backup.json";link.click();URL.revokeObjectURL(url);
      setBackupError("");setBackupNotice(language==="ar"?"تم تصدير النسخة المالية":"Finance backup exported");
    }catch(e){setBackupError(e instanceof Error?e.message:"Backup export failed");}
  };
  const importFinanceBackup=async(file?:File)=>{
    if(!file)return;
    try{
      const payload=JSON.parse(await file.text());
      if(!confirm(language==="ar"?"سيتم استبدال المصروفات والدخل والشهادات الحالية. هل تريد المتابعة؟":"Current expenses, income and certificates will be replaced. Continue?"))return;
      const response=await fetch("/api/backup/restore",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(String(result.error||"تعذر استعادة النسخة"));
      setBackupError("");setBackupNotice(language==="ar"?"تمت استعادة النسخة المالية":"Finance backup restored");
      window.setTimeout(()=>window.location.reload(),500);
    }catch(e){setBackupError(e instanceof Error?e.message:"Invalid backup file");}
  };
  return <div className={theme==="dark"?"min-h-screen bg-slate-950 text-slate-100 dark":"min-h-screen bg-slate-50 text-slate-900"} dir={language==="ar"?"rtl":"ltr"}>
    <header className="sticky top-0 z-40 border-b border-slate-700/30 bg-slate-950/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div><div className="text-xs font-black tracking-[.24em] text-amber-400">SMART • FINANCE</div><h1 className="text-xl font-black">SMARTCOST</h1></div>
        <nav className="flex flex-wrap items-center gap-2">
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setScreen("expenses")}>{language==="ar"?"المصروفات":"Expenses"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setScreen("income")}>{language==="ar"?"الدخل والشهادات":"Income & certificates"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>void exportFinanceBackup()}>{language==="ar"?"تصدير نسخة مالية":"Export finance backup"}</button>
          <label className="cursor-pointer rounded-xl border border-slate-700 px-3 py-2 text-sm">{language==="ar"?"استعادة نسخة":"Restore backup"}<input className="sr-only" type="file" accept=".json,application/json" onChange={e=>{const file=e.target.files?.[0];void importFinanceBackup(file);e.currentTarget.value="";}} /></label>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setLanguage(language==="ar"?"en":"ar")}>{language==="ar"?"English":"العربية"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?(language==="ar"?"الوضع الفاتح":"Light mode"):(language==="ar"?"الوضع الداكن":"Dark mode")}</button>
          <select aria-label="Currency" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)}><option>EGP</option><option>SAR</option><option>AED</option><option>USD</option><option>EUR</option></select>
        </nav>
      </div>
    </header>
    {(backupNotice||backupError)&&<div role="status" className={backupError?"mx-auto max-w-7xl px-4 py-2 text-sm text-rose-300":"mx-auto max-w-7xl px-4 py-2 text-sm text-emerald-300"}>{backupError||backupNotice}</div>}
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5">
      {screen==="expenses"?<ExpensesView language={language} currency={currency}/>:<IncomeCertificatesView language={language} currency={currency}/>}
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-6 text-xs text-slate-500">SMARTCOST — {language==="ar"?"تطبيق مالي مستقل. لا تشارك بياناتك المالية على جهاز عام.":"Standalone finance app. Avoid exposing financial data on shared devices."}</footer>
  </div>;
}
