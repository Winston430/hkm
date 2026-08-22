import { useMemo } from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Receipt } from "@phosphor-icons/react";
import { formatCurrency } from "../../lib/format";
import type { PaymentMethod, Sale } from "../../types/sale";

const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

export function SalesReportCard({ sales }: { sales: Sale[] }) {
  const completed = useMemo(
    () => sales.filter((s) => s.status === "completed"),
    [sales],
  );

  const totalRevenue = completed.reduce((sum, s) => sum + s.totalAmount, 0);
  const transactionCount = completed.length;
  const averageSale = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  const byPayment = useMemo(() => {
    const map = new Map<PaymentMethod, { count: number; amount: number }>();
    for (const sale of completed) {
      const entry = map.get(sale.paymentMethod) ?? { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += sale.totalAmount;
      map.set(sale.paymentMethod, entry);
    }
    return Array.from(map.entries());
  }, [completed]);

  return (
    <Card>
      <CardHeader title="Sales Report" />
      {completed.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No sales in this period"
          description="Completed sales for the selected range will be summarized here."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] uppercase text-text-muted">Revenue</p>
              <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">
                Transactions
              </p>
              <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
                {transactionCount}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">
                Average Sale
              </p>
              <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
                {formatCurrency(averageSale)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium text-text-secondary">
              By Payment Method
            </p>
            <div className="flex flex-col gap-2">
              {byPayment.map(([method, data]) => (
                <div
                  key={method}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-text-primary">
                    {paymentLabel[method]}
                  </span>
                  <span className="tabular-nums text-text-secondary">
                    {data.count} · {formatCurrency(data.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
