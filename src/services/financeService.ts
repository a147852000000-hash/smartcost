import type { ExpenseType } from "../contracts/financeContract";
import { StorageAdapter } from "./storageAdapter";
import { STORAGE_KEYS } from "./storageKeys";

export interface CanonicalExpenseInput {
  id?: string; type: ExpenseType; title?: string; amount: number; category?: string; date: string;
  paymentMethod?: string; receiptUrl?: string; notes?: string | null; createdAt?: string;
}

const EXPENSES_KEY = STORAGE_KEYS.EXPENSES;

function readAll(): Array<Record<string, unknown>> {
  return StorageAdapter.getItem<Array<Record<string, unknown>>>(EXPENSES_KEY, []) || [];
}
function writeAll(items: Array<Record<string, unknown>>): void {
  StorageAdapter.setItem(EXPENSES_KEY, items);
}

export async function getAllExpenses(): Promise<Array<Record<string, unknown>>> {
  return readAll();
}

export async function getExpenses(
  query: { type?: ExpenseType | ExpenseType[]; from?: string; to?: string } = {}
): Promise<Array<Record<string, unknown>>> {
  const rows = await getAllExpenses();
  const types = query.type ? (Array.isArray(query.type) ? query.type : [query.type]) : undefined;
  return rows.filter((x) => {
    const type = String(x.type || "house");
    const date = String(x.date || "").slice(0, 10);
    return (
      (!types || types.includes(type as ExpenseType)) &&
      (!query.from || date >= query.from) &&
      (!query.to || date <= query.to)
    );
  });
}

export async function createCanonicalFinanceExpense(
  input: CanonicalExpenseInput
): Promise<Record<string, unknown>> {
  const items = readAll();
  const id = typeof input.id === "string" && input.id ? input.id : `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const record: Record<string, unknown> = {
    id,
    title: input.title || input.category || input.type,
    amount: input.amount,
    type: input.type,
    category: input.category || input.type,
    date: input.date,
    paymentMethod: input.paymentMethod || "unknown",
    receiptUrl: input.receiptUrl || null,
    notes: input.notes ?? null,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };
  writeAll([record, ...items]);
  return record;
}

export async function updateCanonicalFinanceExpense(
  id: string,
  patch: Partial<CanonicalExpenseInput>
): Promise<Record<string, unknown>> {
  const items = readAll();
  const idx = items.findIndex((row) => String(row.id) === id);
  if (idx === -1) throw new Error("المصروف غير موجود.");
  const current = items[idx];
  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
  items[idx] = merged;
  writeAll(items);
  return merged;
}

export async function deleteCanonicalFinanceExpense(id: string): Promise<void> {
  const items = readAll().filter((row) => String(row.id) !== id);
  writeAll(items);
}

export const addExpense = createCanonicalFinanceExpense;

export const financeService = {
  getAllExpenses,
  getExpenses,
  createCanonicalFinanceExpense,
  addExpense,
  updateCanonicalFinanceExpense,
  deleteCanonicalFinanceExpense,
};
