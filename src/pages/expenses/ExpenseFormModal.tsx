// pages/expenses/ExpenseFormModal.tsx
import { useEffect, useState, type FormEvent } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { parseNonNegativeNumber } from "../../lib/validation";
import {
  expenseCategories,
  expenseCategoryLabel,
  type Expense,
  type ExpenseCategory,
} from "../../types/expense";
import type { ExpenseInput } from "../../services/expenses";

interface FormState {
  category: ExpenseCategory;
  amount: string;
  date: string;
  note: string;
}

function todayDateInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyForm(): FormState {
  return { category: "other", amount: "", date: todayDateInputValue(), note: "" };
}

function toForm(expense: Expense): FormState {
  const d = new Date(expense.date);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { category: expense.category, amount: String(expense.amount), date, note: expense.note ?? "" };
}

export function ExpenseFormModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: ExpenseInput) => Promise<void>;
  onUpdate: (id: string, input: ExpenseInput) => Promise<void>;
  expense: Expense | null;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(expense ? toForm(expense) : emptyForm());
      setError(null);
    }
  }, [open, expense]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.date) {
      setError("Select a date for this expense.");
      return;
    }

    const amount = parseNonNegativeNumber(form.amount);
    if (amount === null || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    const dateMs = new Date(`${form.date}T00:00:00`).getTime();
    if (Number.isNaN(dateMs)) {
      setError("Select a valid date.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: ExpenseInput = {
        category: form.category,
        amount,
        date: dateMs,
        note: form.note.trim() || null,
      };
      if (expense) {
        await onUpdate(expense.id, payload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch {
      setError("Unable to save this expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? "Edit Expense" : "Record Expense"}
      width="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="expense-form" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Saving
              </span>
            ) : (
              "Save Expense"
            )}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="expense-category"
            label="Category"
            value={form.category}
            disabled={submitting}
            onChange={(e) => set("category", e.target.value as ExpenseCategory)}
          >
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {expenseCategoryLabel[cat]}
              </option>
            ))}
          </Select>
          <Input
            id="expense-amount"
            label="Amount"
            type="number"
            min="0"
            disabled={submitting}
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        <Input
          id="expense-date"
          label="Date"
          type="date"
          disabled={submitting}
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />

        <Input
          id="expense-note"
          label="Note (optional)"
          disabled={submitting}
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
          >
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}