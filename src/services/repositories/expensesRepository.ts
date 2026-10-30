import type { Expense, BudgetSummary, MonthlyIncome, BankCertificate } from "../../types";
import { STORAGE_KEYS } from "../storageKeys";
import { StorageAdapter } from "../storageAdapter";

const emptyBudget: BudgetSummary = { totalBudget: 0, totalExpenses: 0, remaining: 0, percentUsed: 0 };
export class ExpensesRepository {
  static getExpenses(): Expense[] { return StorageAdapter.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []) || []; }
  static saveExpenses(items: Expense[]): void { StorageAdapter.setItem(STORAGE_KEYS.EXPENSES, items); }
  static addExpense(item: Expense): Expense[] { const items = [item, ...this.getExpenses()]; this.saveExpenses(items); return items; }
  static updateExpense(item: Expense): Expense[] { const items = this.getExpenses().map(x => x.id === item.id ? item : x); this.saveExpenses(items); return items; }
  static deleteExpense(id: string): Expense[] { const items = this.getExpenses().filter(x => x.id !== id); this.saveExpenses(items); return items; }
  static getBudget(): BudgetSummary { return StorageAdapter.getItem<BudgetSummary>(STORAGE_KEYS.BUDGET, emptyBudget) || emptyBudget; }
  static saveBudget(b: BudgetSummary): void { StorageAdapter.setItem(STORAGE_KEYS.BUDGET, b); }
  static getMonthlyIncome(): MonthlyIncome[] { return StorageAdapter.getItem<MonthlyIncome[]>(STORAGE_KEYS.MONTHLY_INCOME, []) || []; }
  static saveMonthlyIncome(items: MonthlyIncome[]): void { StorageAdapter.setItem(STORAGE_KEYS.MONTHLY_INCOME, items); }
  static getBankCertificates(): BankCertificate[] { return StorageAdapter.getItem<BankCertificate[]>(STORAGE_KEYS.BANK_CERTIFICATES, []) || []; }
  static saveBankCertificates(items: BankCertificate[]): void { StorageAdapter.setItem(STORAGE_KEYS.BANK_CERTIFICATES, items); }
}
