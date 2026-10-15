import React, { useEffect, useState } from "react";
import { Camera, X, Upload, Car, Gauge } from "lucide-react";
import type { VehicleAccidentRecord, Language } from "../types";
import { VehiclesRepository } from "../services";

interface VehicleCameraModalProps {
  isOpen:boolean; initialMode?:"accident"|"odometer"; onClose:()=>void;
  onAccidentSaved?:(accident:VehicleAccidentRecord)=>void;
  onOdometerCaptured?:(odometer:number,photoUrl?:string)=>void;
  currency?:string; language?:Language; vehicleId?:string; odometerOnly?:boolean;
}
export const VehicleCameraModal:React.FC<VehicleCameraModalProps>=({isOpen,initialMode="accident",onClose,onAccidentSaved,onOdometerCaptured,currency="EGP",language="ar",vehicleId,odometerOnly=false})=>{
 const isAr=language==="ar", [mode,setMode]=useState<"accident"|"odometer">(initialMode);
 const [photo,setPhoto]=useState<string>(""),[title,setTitle]=useState(""),[date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [time,setTime]=useState(new Date().toTimeString().slice(0,5)),[location,setLocation]=useState(""),[damage,setDamage]=useState(""),[notes,setNotes]=useState(""),[odometer,setOdometer]=useState("");
 useEffect(()=>{if(isOpen){setMode(odometerOnly?"odometer":initialMode);setDate(new Date().toISOString().slice(0,10));setTime(new Date().toTimeString().slice(0,5));setPhoto("");}},[isOpen,initialMode,odometerOnly]);
 if(!isOpen)return null;
 const captureFile=(file?:File)=>{if(!file)return;if(!file.type.startsWith("image/"))return;const reader=new FileReader();reader.onload=()=>setPhoto(String(reader.result||""));reader.readAsDataURL(file)};
 const save=()=>{
  if(mode==="odometer"){const km=Number(odometer);if(Number.isFinite(km)&&km>=0)onOdometerCaptured?.(km,photo||undefined);onClose();return}
  const item:VehicleAccidentRecord={id:crypto.randomUUID(),vehicleId:vehicleId||"default_vehicle",title:title.trim()||(isAr?"حادث مروري":"Traffic accident"),photoUrl:photo,date,time,location:location.trim(),estimatedDamage:Number(damage)||0,notes:notes.trim(),createdAt:new Date().toISOString()};
  VehiclesRepository.addAccidentRecord(item);onAccidentSaved?.(item);onClose();
 };
 return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"><section className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl">
 <header className="flex items-center justify-between border-b border-slate-800 p-4"><div className="flex items-center gap-2"><Camera className="text-amber-400"/><h2 className="font-black">{isAr?"توثيق مصروف المركبة":"Vehicle record"}</h2></div><button onClick={onClose} aria-label="Close"><X/></button></header>
 <div className="space-y-4 p-4"><div className="flex gap-2">{!odometerOnly&&<button className="rounded-xl border border-slate-700 px-3 py-2" onClick={()=>setMode("accident")}>{isAr?"حادث":"Accident"}</button>}<button className="rounded-xl border border-slate-700 px-3 py-2" onClick={()=>setMode("odometer")}>{isAr?"قراءة العداد":"Odometer"}</button></div>
 <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 p-4"><Upload/><span>{isAr?"اختر صورة من الجهاز":"Choose an image"}</span><input type="file" accept="image/*" capture="environment" className="max-w-44" onChange={e=>captureFile(e.target.files?.[0])}/></label>
 {photo&&<img src={photo} alt="Vehicle evidence" className="max-h-64 w-full rounded-xl object-contain"/>}
 {mode==="odometer"?<label className="block text-sm">{isAr?"قراءة العداد بالكيلومتر":"Odometer reading (km)"}<input type="number" min="0" value={odometer} onChange={e=>setOdometer(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>:<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <label className="text-sm">{isAr?"وصف الحادث":"Description"}<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 <label className="text-sm">{isAr?"التكلفة التقديرية":"Estimated cost"}<input type="number" min="0" value={damage} onChange={e=>setDamage(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 <label className="text-sm">{isAr?"التاريخ":"Date"}<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 <label className="text-sm">{isAr?"الوقت":"Time"}<input type="time" value={time} onChange={e=>setTime(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 <label className="text-sm">{isAr?"الموقع":"Location"}<input value={location} onChange={e=>setLocation(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 <label className="text-sm">{isAr?"ملاحظات":"Notes"}<input value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 p-3"/></label>
 </div>}
 <div className="flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2">{isAr?"إلغاء":"Cancel"}</button><button onClick={save} className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-black">{isAr?"حفظ":"Save"}</button></div>
 <p className="text-xs text-slate-500">{isAr?"تُحفظ السجلات في قسم المصروفات فقط؛ لا توجد خزنة منفصلة في هذا التطبيق.":"Records remain within finance features; no separate vault is included."}</p>
 </div></section></div>
};
