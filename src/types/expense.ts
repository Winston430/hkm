// types/expense.ts
export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "salaries"
  | "transport"
  | "supplies"
  | "food"
  | "maintenance"
  | "other";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  /** The day this expense applies to (start-of-day ms) — not necessarily
   *  the moment it was entered into the system. */
  date: number;
  note: string | null;
  createdById: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
}

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  salaries: "Salaries",
  transport: "Transport",
  supplies: "Supplies",
  food: "Food",
  maintenance: "Maintenance",
  other: "Other",
};

export const expenseCategories = Object.keys(expenseCategoryLabel) as ExpenseCategory[];