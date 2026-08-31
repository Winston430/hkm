import { ChartLineUp } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LineChart, type LineChartPoint } from "../../components/charts/LineChart";
import { formatCurrency } from "../../lib/format";

export function RevenueTrendCard({ series }: { series: LineChartPoint[] }) {
  const hasRevenue = series.some((point) => point.value > 0);

  return (
    <Card>
      <CardHeader title="Revenue Trend" />
      {!hasRevenue ? (
        <EmptyState
          icon={<ChartLineUp size={22} />}
          title="No revenue in this period"
          description="The revenue trend will plot here once sales come in."
        />
      ) : (
        <LineChart data={series} formatValue={formatCurrency} />
      )}
    </Card>
  );
}
