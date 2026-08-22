import { useEffect, useMemo, useState } from "react";
import { Receipt } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Pagination } from "../../components/ui/Pagination";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { listSalesByAgent } from "../../services/sales";
import { formatCurrency, formatDayLabel, formatTime } from "../../lib/format";
import type { PaymentMethod, Sale, SaleStatus } from "../../types/sale";

type Status = "loading" | "success" | "error";
const PAGE_SIZE = 8;
const HISTORY_LIMIT = 200;

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

export function MySalesHistory({ agentId }: { agentId: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [page, setPage] = useState(1);

  async function load() {
    setStatus("loading");
    try {
      const data = await listSalesByAgent(agentId, HISTORY_LIMIT);
      setSales(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, [agentId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesTerm = !term || sale.invoiceNumber.toLowerCase().includes(term);
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

  return (
    <Card padded={false} className="p-5">
      <CardHeader title="My Sales History" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <SearchInput
            placeholder="Search invoice number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full max-w-[160px]">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="w-full max-w-[180px]">
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentMethod)}
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
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} columns={5} />
          ))}
        </div>
      )}

      {status === "error" && (
        <ErrorState
          title="Unable to load your sales"
          description="Check your connection or permissions and try again."
          onRetry={load}
        />
      )}

      {status === "success" && filtered.length === 0 && (
        <EmptyState
          icon={<Receipt size={22} />}
          title={sales.length === 0 ? "No sales recorded yet" : "No matches"}
          description={
            sales.length === 0
              ? "Sales you complete will show up here."
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
              <Th>Amount</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
            </TableHead>
            <tbody>
              {paged.map((sale) => (
                <Tr key={sale.id}>
                  <Td className="font-medium">{sale.invoiceNumber}</Td>
                  <Td className="text-text-secondary">
                    {formatDayLabel(sale.createdAt)} {formatTime(sale.createdAt)}
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
  );
}
