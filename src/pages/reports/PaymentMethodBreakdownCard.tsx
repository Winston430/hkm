// pages/reports/PaymentMethodBreakdownCard.tsx
import { useMemo } from "react";
import { CreditCard } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import type { PaymentMethod, Sale } from "../../types/sale";

const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

export function PaymentMethodBreakdownCard({ sales }: { sales: Sale[] }) {
  const rows = useMemo(() => {
    const completed = sales.filter((s) => s.status === "completed");
    const counts = new Map<PaymentMethod, number>();
    for (const sale of completed) {
      counts.set(sale.paymentMethod, (counts.get(sale.paymentMethod) ?? 0) + 1);
    }
    const total = completed.length;
    return (Object.keys(paymentLabel) as PaymentMethod[])
      .map((method) => {
        const count = counts.get(method) ?? 0;
        return { method, count, percent: total === 0 ? 0 : (count / total) * 100 };
      })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [sales]);

  return (
    <Card>
      <CardHeader title="Transactions by Payment Method" />
      {rows.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={22} />}
          title="No completed sales in this period"
          description="Payment method breakdown will appear here once sales come in."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.method} className="flex items-center justify-between text-[13px]">
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
      )}
    </Card>
  );
}