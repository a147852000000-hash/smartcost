import type { VehicleAccidentRecord } from "../../types";
import { STORAGE_KEYS } from "../storageKeys";
import { StorageAdapter } from "../storageAdapter";
export class VehiclesRepository {
  static getAccidentRecords():VehicleAccidentRecord[]{return StorageAdapter.getItem<VehicleAccidentRecord[]>(STORAGE_KEYS.ACCIDENT_RECORDS,[])||[]}
  static saveAccidentRecords(items:VehicleAccidentRecord[]):void{StorageAdapter.setItem(STORAGE_KEYS.ACCIDENT_RECORDS,items)}
  static addAccidentRecord(item:VehicleAccidentRecord):VehicleAccidentRecord[]{const items=[item,...this.getAccidentRecords()];this.saveAccidentRecords(items);return items}
  static deleteAccidentRecord(id:string):VehicleAccidentRecord[]{const items=this.getAccidentRecords().filter(x=>x.id!==id);this.saveAccidentRecords(items);return items}
}
