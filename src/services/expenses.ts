// services/expenses.ts — new file, reconstructed to match auth.ts's plain-number-timestamp convention (see note above)
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Expense, ExpenseCategory } from "../types/expense";

const expensesCollection = collection(db, "expenses");

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  date: number;
  note: string | null;
}

export async function listAllExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense);
}

export async function createExpense(
  input: ExpenseInput,
  createdById: string,
  createdByName: string,
): Promise<Expense> {
  const now = Date.now();
  const payload = { ...input, createdById, createdByName, createdAt: now, updatedAt: now };
  const ref = await addDoc(expensesCollection, payload);
  return { id: ref.id, ...payload };
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "expenses", id), { ...input, updatedAt });
  return { updatedAt };
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, "expenses", id));
}