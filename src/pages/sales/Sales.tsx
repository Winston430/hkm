// pages/sales/Sales.tsx
import { useEffect, useMemo, useState } from "react";
import {
  ArrowCounterClockwise,
  ChartLineUp,
  Coins,
  DownloadSimple,
  Receipt,
} from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Pagination } from "../../components/ui/Pagination";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { MetricCard } from "../../components/ui/MetricCard";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { useAuth } from "../../hooks/useAuth";
import { listAllSales, refundSale } from "../../services/sales";
import { formatCurrency, formatDayLabel, formatTime } from "../../lib/format";
import { exportToCsv } from "../../lib/exportCsv";
import type { PaymentMethod, Sale, SaleStatus } from "../../types/sale";
import { toast } from "../../lib/toast";
import { SaleDetailModal } from "./SaleDetailModal";

type Status = "loading" | "success" | "error";
const PAGE_SIZE = 10;
const FLASH_DURATION_MS = 900;

const statusVariant: Record<SaleStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  refunded: "warning",
  cancelled: "danger",
};

const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

function isSameDay(ms: number, dateStr: string) {
  if (!dateStr) return true;
  const d = new Date(ms);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return iso === dateStr;
}

export function Sales() {
  const { profile, hasPermission } = useAuth();
  const canRefund = hasPermission("sales.refund");

  const [status, setStatus] = useState<Status>("loading");
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const data = await listAllSales();
      setSales(data);
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesTerm =
        !term ||
        sale.invoiceNumber.toLowerCase().includes(term) ||
        sale.agentName.toLowerCase().includes(term);
      const matchesDate = isSameDay(sale.createdAt, date);
      const matchesPayment =
        paymentFilter === "all" || sale.paymentMethod === paymentFilter;
      return matchesTerm && matchesDate && matchesPayment;
    });
  }, [sales, search, date, paymentFilter]);

  const stats = useMemo(() => {
    let completedRevenue = 0;
    let completedCount = 0;
    let refundedAmount = 0;

    for (const sale of filtered) {
      if (sale.status === "completed") {
        completedRevenue += sale.totalAmount;
        completedCount++;
      } else if (sale.status === "refunded") {
        refundedAmount += sale.totalAmount;
      }
    }

    return {
      totalSales: filtered.length,
      totalRevenue: completedRevenue,
      refundedAmount,
      avgSaleValue: completedCount === 0 ? 0 : completedRevenue / completedCount,
    };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, date, paymentFilter]);

  async function handleRefund(sale: Sale) {
    if (!profile || !canRefund) return;
    await refundSale(sale, profile.id, profile.name);
    setSales((prev) =>
      prev.map((s) => (s.id === sale.id ? { ...s, status: "refunded" } : s)),
    );
    setFlashId(sale.id);
    toast.success("Sale refunded successfully.");
  }

  function handleExport() {
    const dateSlug = new Date().toISOString().slice(0, 10);
    exportToCsv(
      `sales-${dateSlug}`,
      filtered.map((sale) => ({
        Invoice: sale.invoiceNumber,
        Date: formatDayLabel(sale.createdAt),
        Time: formatTime(sale.createdAt),
        Agent: sale.agentName,
        Items: sale.items.length,
        Amount: sale.totalAmount,
        Payment: paymentLabel[sale.paymentMethod],
        Status: sale.status,
      })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Review completed transactions"
        action={
          <Button
            variant="secondary"
            icon={<DownloadSimple size={15} />}
            onClick={handleExport}
            disabled={status !== "success" || filtered.length === 0}
          >
            Export CSV
          </Button>
        }
      />

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

      {status === "success" && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Total Sales"
            value={String(stats.totalSales)}
            icon={<Receipt size={16} />}
          />
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<Coins size={16} />}
          />
          <MetricCard
            label="Refunded"
            value={formatCurrency(stats.refundedAmount)}
            tone={stats.refundedAmount > 0 ? "attention" : "default"}
            icon={<ArrowCounterClockwise size={16} />}
          />
          <MetricCard
            label="Avg Sale Value"
            value={formatCurrency(stats.avgSaleValue)}
            icon={<ChartLineUp size={16} />}
          />
        </div>
      )}

      <Card padded={false} className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-full max-w-xs">
            <SearchInput
              placeholder="Search invoice or agent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[160px]">
            <Input
              type="date"
              aria-label="Filter by date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[180px]">
            <Select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as "all" | PaymentMethod)
              }
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile-money">Mobile Money</option>
            </Select>
          </div>
        </div>

        {status === "loading" && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} columns={7} />
            ))}
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && filtered.length === 0 && (
          <EmptyState
            icon={<Receipt size={22} />}
            title={sales.length === 0 ? "No sales yet" : "No matches"}
            description={
              sales.length === 0
                ? "Completed sales will appear here as they come in."
                : "Try a different search, date, or payment filter."
            }
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <Th>Invoice</Th>
                  <Th>Date</Th>
                  <Th>Agent</Th>
                  <Th>Items</Th>
                  <Th>Amount</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                </TableHead>
                <tbody>
                  {paged.map((sale) => (
                    <Tr
                      key={sale.id}
                      className={sale.id === flashId ? "row-flash" : undefined}
                    >
                      <Td>
                        <button
                          type="button"
                          onClick={() => setSelected(sale)}
                          className="rounded-sm font-medium text-text-primary underline-offset-2 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                        >
                          {sale.invoiceNumber}
                        </button>
                      </Td>
                      <Td className="text-text-secondary">
                        {formatDayLabel(sale.createdAt)} {formatTime(sale.createdAt)}
                      </Td>
                      <Td className="text-text-secondary">{sale.agentName}</Td>
                      <Td className="text-text-secondary">{sale.items.length}</Td>
                      <Td className="font-medium tabular-nums">
                        {formatCurrency(sale.totalAmount)}
                      </Td>
                      <Td className="text-text-secondary">
                        {paymentLabel[sale.paymentMethod]}
                      </Td>
                      <Td>
                        <Badge variant={statusVariant[sale.status]}>
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </Badge>
                      </Td>
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

      <SaleDetailModal
        sale={selected}
        onClose={() => setSelected(null)}
        onRefund={handleRefund}
        canRefund={canRefund}
      />
    </div>
  );
}