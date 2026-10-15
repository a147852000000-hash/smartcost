import { useState } from "react";
import { ExpensesView } from "./components/ExpensesView";
import { IncomeCertificatesView } from "./components/IncomeCertificatesView";
import type { Language } from "./types";

export default function App() {
  const [language,setLanguage]=useState<Language>("ar");
  const [currency,setCurrency]=useState("EGP");
  const [theme,setTheme]=useState<"light"|"dark">("dark");
  const [screen,setScreen]=useState<"expenses"|"income">("expenses");
  return <div className={theme==="dark"?"min-h-screen bg-slate-950 text-slate-100 dark":"min-h-screen bg-slate-50 text-slate-900"} dir={language==="ar"?"rtl":"ltr"}>
    <header className="sticky top-0 z-40 border-b border-slate-700/30 bg-slate-950/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div><div className="text-xs font-black tracking-[.24em] text-amber-400">SMART • FINANCE</div><h1 className="text-xl font-black">SMARTCOST</h1></div>
        <nav className="flex flex-wrap items-center gap-2">
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setScreen("expenses")}>{language==="ar"?"المصروفات":"Expenses"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setScreen("income")}>{language==="ar"?"الدخل والشهادات":"Income & certificates"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setLanguage(language==="ar"?"en":"ar")}>{language==="ar"?"English":"العربية"}</button>
          <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?(language==="ar"?"الوضع الفاتح":"Light mode"):(language==="ar"?"الوضع الداكن":"Dark mode")}</button>
          <select aria-label="Currency" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)}><option>EGP</option><option>SAR</option><option>AED</option><option>USD</option><option>EUR</option></select>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5">
      {screen==="expenses"?<ExpensesView language={language} currency={currency}/>:<IncomeCertificatesView language={language} currency={currency}/>}
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-6 text-xs text-slate-500">SMARTCOST — {language==="ar"?"تطبيق مالي مستقل. لا تشارك بياناتك المالية على جهاز عام.":"Standalone finance app. Avoid exposing financial data on shared devices."}</footer>
  </div>;
}
