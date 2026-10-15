function getItem<T>(key:string,fallback:T):T;
function getItem<T>(key:string):T|null;
function getItem<T>(key:string,fallback?:T):T|null {
  try {
    const raw=localStorage.getItem(key);
    if(raw===null)return fallback===undefined?null:fallback;
    try{return JSON.parse(raw) as T}catch{return raw as T}
  } catch { return fallback===undefined?null:fallback; }
}
export const StorageAdapter = {
  setItem<T>(key:string,value:T):boolean {
    try { localStorage.setItem(key, typeof value==="string"?value:JSON.stringify(value)); return true; }
    catch { return false; }
  },
  getItem,
  removeItem(key:string):void { try{localStorage.removeItem(key)}catch{} }
};
