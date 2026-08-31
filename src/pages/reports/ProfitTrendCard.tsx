// pages/reports/ProfitTrendCard.tsx
import { ChartBar } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { BarChart, type BarChartPoint } from "../../components/charts/BarChart";
import { formatCurrency } from "../../lib/format";

export function ProfitTrendCard({ data }: { data: BarChartPoint[] }) {
  const hasData = data.some((point) => point.value !== 0);

  return (
    <Card>
      <CardHeader title="Profit by Period" />
      {!hasData ? (
        <EmptyState
          icon={<ChartBar size={22} />}
          title="No profit in this period"
          description="Profit per period will plot here once sales come in."
        />
      ) : (
        <BarChart data={data} formatValue={formatCurrency} />
      )}
    </Card>
  );
}