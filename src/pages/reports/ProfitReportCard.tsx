// pages/reports/ProfitReportCard.tsx
import { Info } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/format";
import type { ProfitSummary } from "../../lib/profit";

export function ProfitReportCard({
  summary,
  totalExpenses = 0, // Wire real expense totals in once that page exists —
                      // nothing else here needs to change.
}: {
  summary: ProfitSummary;
  totalExpenses?: number;
}) {
  const netProfit = summary.grossProfit - totalExpenses;

  return (
    <Card>
      <CardHeader title="Profit" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase text-text-muted">Revenue</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(summary.revenue)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Cost of Goods</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-secondary">
            {formatCurrency(summary.cogs)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Gross Profit</p>
          <p
            className={`mt-1 text-[20px] font-semibold tabular-nums ${
              summary.grossProfit < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatCurrency(summary.grossProfit)}
          </p>
          <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">
            {summary.marginPercent.toFixed(1)}% margin
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Net Profit</p>
          <p
            className={`mt-1 text-[20px] font-semibold tabular-nums ${
              netProfit < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {totalExpenses > 0
              ? `After ${formatCurrency(totalExpenses)} expenses`
              : "Expense tracking coming soon"}
          </p>
        </div>
      </div>

      {summary.itemsWithUnknownCost > 0 && (
        <p className="mt-4 flex items-start gap-1.5 rounded-md bg-surface-secondary px-3 py-2 text-[11.5px] text-text-muted">
          <Info size={13} className="mt-0.5 shrink-0" />
          {summary.itemsWithUnknownCost} sale line item
          {summary.itemsWithUnknownCost === 1 ? "" : "s"} reference a product
          that no longer exists, so its cost couldn't be included — profit
          may be slightly overstated.
        </p>
      )}

      <p className="mt-3 text-[11px] text-text-muted">
        Profit uses each product's current cost price, not the cost at the
        time of sale — figures may shift slightly if a cost has changed
        since a sale was recorded.
      </p>
    </Card>
  );
}