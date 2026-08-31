// pages/expenses/Expenses.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  DownloadSimple,
  PencilSimple,
  Plus,
  Receipt,
  Tag,
  TrashSimple,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Pagination } from "../../components/ui/Pagination";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { MetricCard } from "../../components/ui/MetricCard";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { useAuth } from "../../hooks/useAuth";
import {
  createExpense,
  deleteExpense,
  listAllExpenses,
  updateExpense,
  type ExpenseInput,
} from "../../services/expenses";
import { formatCurrency, formatDayLabel } from "../../lib/format";
import { exportToCsv } from "../../lib/exportCsv";
import { toast } from "../../lib/toast";
import { rangeOptions, resolveDateRange, type RangeMode } from "../../lib/dateRange";
import { expenseCategoryLabel, type Expense } from "../../types/expense";
import { ExpenseFormModal } from "./ExpenseFormModal";

type Status = "loading" | "success" | "error";
const PAGE_SIZE = 10;
const FLASH_DURATION_MS = 900;

const rowActionButton =
  "flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35";

export function Expenses() {
  const { profile, hasPermission } = useAuth();
  const canManage = hasPermission("expenses.manage");

  const [status, setStatus] = useState<Status>("loading");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rangeMode, setRangeMode] = useState<RangeMode>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const data = await listAllExpenses();
      setExpenses(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  const resolvedRange = useMemo(
    () => resolveDateRange(rangeMode, customFrom, customTo),
    [rangeMode, customFrom, customTo],
  );

  const customRangeInvalid =
    rangeMode === "custom" && customFrom !== "" && customTo !== "" && !resolvedRange;

  const filtered = useMemo(() => {
    if (!resolvedRange) return [];
    const { start, end } = resolvedRange;
    return expenses
      .filter((e) => e.date <= end && (start === null || e.date >= start))
      .sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);
  }, [expenses, resolvedRange]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const count = filtered.length;
    const average = count === 0 ? 0 : total / count;

    const byCategory = new Map<string, number>();
    for (const e of filtered) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
    const topEntry = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topEntry
      ? expenseCategoryLabel[topEntry[0] as keyof typeof expenseCategoryLabel]
      : "—";

    return { total, count, average, topCategory };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [rangeMode, customFrom, customTo]);

  function openCreate() {
    if (!canManage) return;
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    if (!canManage) return;
    setEditing(expense);
    setFormOpen(true);
  }

  async function handleCreate(input: ExpenseInput) {
    if (!profile || !canManage) return;
    const created = await createExpense(input, profile.id, profile.name);
    setExpenses((prev) => [...prev, created]);
    setFlashId(created.id);
    toast.success("Expense recorded successfully.");
  }

  async function handleUpdate(id: string, input: ExpenseInput) {
    if (!canManage) return;
    const { updatedAt } = await updateExpense(id, input);
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...input, updatedAt } : e)));
    setFlashId(id);
    toast.success("Expense updated successfully.");
  }

  async function handleDelete() {
    if (!deleting || !canManage) return;
    setDeleteSubmitting(true);
    try {
      await deleteExpense(deleting.id);
      setExpenses((prev) => prev.filter((e) => e.id !== deleting.id));
      setDeleting(null);
      toast.success("Expense deleted successfully.");
    } catch {
      toast.error("Unable to delete expense.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  function handleExport() {
    const dateSlug = new Date().toISOString().slice(0, 10);
    exportToCsv(
      `expenses-${dateSlug}`,
      filtered.map((e) => ({
        Date: formatDayLabel(e.date),
        Category: expenseCategoryLabel[e.category],
        Amount: e.amount,
        Note: e.note ?? "",
        "Recorded By": e.createdByName,
      })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Record rent, utilities, and other business costs"
        action={
          <>
            <Button
              variant="secondary"
              icon={<DownloadSimple size={15} />}
              onClick={handleExport}
              disabled={status !== "success" || filtered.length === 0}
            >
              Export CSV
            </Button>
            {canManage && (
              <Button icon={<Plus size={15} />} onClick={openCreate}>
                Record Expense
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-[160px]">
          <Select
            label="Date range"
            value={rangeMode}
            onChange={(e) => setRangeMode(e.target.value as RangeMode)}
          >
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        {rangeMode === "custom" && (
          <>
            <div className="w-full max-w-[160px]">
              <Input
                type="date"
                label="From"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-full max-w-[160px]">
              <Input
                type="date"
                label="To"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {customRangeInvalid && (
        <Card className="mb-6">
          <p role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            The "From" date must be on or before the "To" date.
          </p>
        </Card>
      )}

      {rangeMode === "custom" && (!customFrom || !customTo) && (
        <Card className="mb-6">
          <p className="text-[13px] text-text-secondary">
            Pick both a "From" and "To" date to view this report.
          </p>
        </Card>
      )}

      {status === "loading" && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <div className="skeleton mb-3 h-3 w-20" />
              <div className="skeleton h-7 w-16" />
            </div>
          ))}
        </div>
      )}

      {status === "success" && resolvedRange && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Total Expenses" value={formatCurrency(stats.total)} icon={<Wallet size={16} />} />
          <MetricCard label="Entries" value={String(stats.count)} icon={<Receipt size={16} />} />
          <MetricCard label="Average per Entry" value={formatCurrency(stats.average)} icon={<Calculator size={16} />} />
          <MetricCard label="Top Category" value={stats.topCategory} icon={<Tag size={16} />} />
        </div>
      )}

      <Card padded={false} className="p-5">
        {status === "loading" && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} columns={5} />
            ))}
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && resolvedRange && filtered.length === 0 && (
          <EmptyState
            icon={<Wallet size={22} />}
            title={expenses.length === 0 ? "No expenses recorded yet" : "No expenses in this period"}
            description={
              expenses.length === 0
                ? "Record rent, utilities, salaries, and other costs to track your net profit accurately."
                : "Try a different date range."
            }
            action={
              expenses.length === 0 && canManage ? (
                <Button size="sm" icon={<Plus size={15} />} onClick={openCreate}>
                  Record Expense
                </Button>
              ) : undefined
            }
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <Th>Date</Th>
                  <Th>Category</Th>
                  <Th>Amount</Th>
                  <Th>Note</Th>
                  <Th>Recorded By</Th>
                  {canManage && <Th>Actions</Th>}
                </TableHead>
                <tbody>
                  {paged.map((expense) => (
                    <Tr key={expense.id} className={expense.id === flashId ? "row-flash" : undefined}>
                      <Td className="text-text-secondary">{formatDayLabel(expense.date)}</Td>
                      <Td className="font-medium">{expenseCategoryLabel[expense.category]}</Td>
                      <Td className="tabular-nums">{formatCurrency(expense.amount)}</Td>
                      <Td className="max-w-[200px] truncate text-text-secondary">
                        {expense.note ?? "—"}
                      </Td>
                      <Td className="text-text-secondary">{expense.createdByName}</Td>
                      {canManage && (
                        <Td>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(expense)}
                              aria-label={`Edit expense on ${formatDayLabel(expense.date)}`}
                              className={`${rowActionButton} hover:bg-surface-secondary hover:text-text-primary`}
                            >
                              <PencilSimple size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(expense)}
                              aria-label={`Delete expense on ${formatDayLabel(expense.date)}`}
                              className={`${rowActionButton} hover:bg-danger-light hover:text-danger`}
                            >
                              <TrashSimple size={15} />
                            </button>
                          </div>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="mt-3">
              <Pagination
                page={page}
                pageCount={pageCount}
                onChange={setPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </Card>

      {canManage && (
        <ExpenseFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          expense={editing}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete expense"
        description={`Delete this ${deleting ? expenseCategoryLabel[deleting.category] : ""} expense of ${
          deleting ? formatCurrency(deleting.amount) : ""
        }? This can't be undone.`}
        confirmLabel="Delete"
        danger
        submitting={deleteSubmitting}
      />
    </div>
  );
}