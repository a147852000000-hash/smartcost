export type Language = "ar" | "en" | "fr";
export type CertificateProfitFrequency = "monthly" | "quarterly" | "semiannual" | "annual" | "maturity";
export type PaymentMethod = "cash" | "card" | "wallet" | "unknown";
export type ExpenseCategoryType = string;

export interface Expense {
  id:string; title:string; amount:number; category:ExpenseCategoryType; date:string;
  paymentMethod:PaymentMethod; receiptUrl?:string; notes?:string; createdAt:string;
}
export interface BudgetSummary { totalBudget:number; totalExpenses:number; remaining:number; percentUsed:number; }
export interface IncomeSourceItem {
  id:string; source:string; amount:number; date:string; type:string; notes?:string; createdAt:string;
}
export interface MonthlyIncome {
  id:string; month:string; salary:number; bonuses:number; otherIncome:number; otherIncomeNote?:string;
  sources?:IncomeSourceItem[]; createdAt:string; updatedAt?:string;
}
export interface BankCertificate {
  id:string; bankName:string; certificateNumber?:string; duration:string; amount:number;
  annualRate?:number; annualProfit?:number; periodicProfit?:number; monthlyEquivalentProfit?:number;
  returnType?:"simple"|"compound"|"variable"; issueDate:string; maturityDate:string; profitDate:string;
  profitAmount:number; profitFrequency:CertificateProfitFrequency; notes?:string; createdAt:string; updatedAt?:string;
}
export interface VehicleAccidentRecord {
  id:string; vehicleId?:string; title:string; photoUrl:string; date:string; time:string; location?:string;
  estimatedDamage?:number; notes?:string; createdAt:string;
}
export interface StudentProfile { id:string; name:string; studentReference?:string; age:string; stage:string; }
export interface StudentExpenseRecord {
  id:string; studentId:string; subCategory:"lessons"|"personal"|"transport"|"school"|"books";
  title:string; amount:number; date:string;
}
export interface MedicalExpenseRecord {
  id:string; familyMember:string; facilityName?:string;
  facilityType:"مستشفى"|"عيادة خاصة"|"عيادة أسنان"|"صيدلية"|"أخرى";
  conditionDescription:string; doctorDiagnosis?:string; examinationCost:number; medicationCost:number;
  date:string; notes?:string;
}
export interface CarTripIncomeRecord {
  id:string; tripNumber:string|number; amount:number; date:string; dayName?:string; time?:string;
  notes?:string; tripType?:string; paymentMethod?:string; createdAt:string;
}
export interface UserProfile {
  vehiclePreferences?: { vehicleType?:string; primaryVehicleName?:string; vehicleShape?:string };
}
