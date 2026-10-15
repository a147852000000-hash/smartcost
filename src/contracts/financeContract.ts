export const EXPENSE_TYPES = ["house","medical","personal","student","vehicle_fuel","vehicle_maint","vehicle_oil","work"] as const;
export type ExpenseType = typeof EXPENSE_TYPES[number];
