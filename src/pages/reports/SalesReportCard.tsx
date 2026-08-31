// pages/reports/SalesReportCard.tsx
import { useMemo } from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/format";
import type { PaymentMethod, Sale } from "../../types/sale";

const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

export function SalesReportCard({ sales }: { sales: Sale[] }) {
  const stats = useMemo(() => {
    const completed = sales.filter((s) => s.status === "completed");
    const revenue = completed.reduce((sum, s) => sum + s.totalAmount, 0);
    const transactions = completed.length;
    const averageSale = transactions === 0 ? 0 : revenue / transactions;

    const countsByMethod = new Map<PaymentMethod, number>();
    for (const sale of completed) {
      countsByMethod.set(sale.paymentMethod, (countsByMethod.get(sale.paymentMethod) ?? 0) + 1);
    }
    const paymentBreakdown = (Object.keys(paymentLabel) as PaymentMethod[])
      .map((method) => {
        const count = countsByMethod.get(method) ?? 0;
        return { method, count, percent: transactions === 0 ? 0 : (count / transactions) * 100 };
      })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);

    return { revenue, transactions, averageSale, paymentBreakdown };
  }, [sales]);

  return (
    <Card>
      <CardHeader title="Sales Report" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase text-text-muted">Revenue</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(stats.revenue)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Transactions</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {stats.transactions}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Average Sale</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(stats.averageSale)}
          </p>
        </div>
      </div>

      {stats.paymentBreakdown.length > 0 && (
        <div className="mt-5 border-t border-border-light pt-4">
          <p className="mb-2.5 text-[11px] uppercase text-text-muted">
            By Payment Method
          </p>
          <ul className="flex flex-col gap-2">
            {stats.paymentBreakdown.map((row) => (
              <li
                key={row.method}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="text-text-secondary">{paymentLabel[row.method]}</span>
                <span className="tabular-nums text-text-primary">
                  <span className="font-medium">{row.count}</span>
                  <span className="ml-1 text-text-muted">
                    transaction{row.count === 1 ? "" : "s"} · {row.percent.toFixed(0)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}