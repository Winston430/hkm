import { useEffect, useMemo, useState } from "react";
import { Receipt } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Pagination } from "../../components/ui/Pagination";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { useAuth } from "../../hooks/useAuth";
import { listAllSales, refundSale } from "../../services/sales";
import { formatCurrency, formatDayLabel, formatTime } from "../../lib/format";
import type { PaymentMethod, Sale, SaleStatus } from "../../types/sale";
import { SaleDetailModal } from "./SaleDetailModal";

type Status = "loading" | "success" | "error";
const PAGE_SIZE = 10;

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
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Sale | null>(null);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesTerm =
        !term ||
        sale.invoiceNumber.toLowerCase().includes(term) ||
        sale.salespersonName.toLowerCase().includes(term);
      const matchesDate = isSameDay(sale.createdAt, date);
      const matchesPayment =
        paymentFilter === "all" || sale.paymentMethod === paymentFilter;
      return matchesTerm && matchesDate && matchesPayment;
    });
  }, [sales, search, date, paymentFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, date, paymentFilter]);

  async function handleRefund(sale: Sale) {
    if (!profile) return;
    await refundSale(sale, profile.id, profile.name);
    await load();
  }

  return (
    <div>
      <PageHeader title="Sales" description="Review completed transactions" />

      <Card padded={false} className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-full max-w-xs">
            <SearchInput
              placeholder="Search invoice or salesperson"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[160px]">
            <Input
              type="date"
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
            <Table>
              <TableHead>
                <Th>Invoice</Th>
                <Th>Date</Th>
                <Th>Salesperson</Th>
                <Th>Items</Th>
                <Th>Amount</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
              </TableHead>
              <tbody>
                {paged.map((sale) => (
                  <Tr key={sale.id}>
                    <Td
                      className="cursor-pointer font-medium text-text-primary hover:underline"
                      onClick={() => setSelected(sale)}
                    >
                      {sale.invoiceNumber}
                    </Td>
                    <Td className="text-text-secondary">
                      {formatDayLabel(sale.createdAt)}{" "}
                      {formatTime(sale.createdAt)}
                    </Td>
                    <Td className="text-text-secondary">
                      {sale.salespersonName}
                    </Td>
                    <Td className="text-text-secondary">
                      {sale.items.length}
                    </Td>
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
      />
    </div>
  );
}
