import { Receipt, Package, WarningCircle, Stack } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { useDashboardData } from "../../hooks/useDashboardData";
import { formatCurrency } from "../../lib/format";
import { MetricCard } from "./MetricCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { RecentSalesCard } from "./RecentSalesCard";
import { LowStockCard } from "./LowStockCard";
import { TopProductsCard } from "./TopProductsCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function Dashboard() {
  const { status, data, reload } = useDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Business overview for today"
      />

      {status === "loading" && <DashboardSkeleton />}

      {status === "error" && (
        <Card>
          <ErrorState
            title="Unable to load dashboard"
            description="Check your connection or permissions and try again."
            onRetry={reload}
          />
        </Card>
      )}

      {status === "success" && data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Sales Today"
              value={formatCurrency(data.revenueToday)}
              icon={<Receipt size={16} />}
            />
            <MetricCard
              label="Transactions Today"
              value={String(data.salesToday.length)}
              icon={<Stack size={16} />}
            />
            <MetricCard
              label="Low Stock"
              value={String(data.lowStockProducts.length)}
              tone={data.lowStockProducts.length > 0 ? "attention" : "default"}
              icon={<WarningCircle size={16} />}
            />
            <MetricCard
              label="Active Products"
              value={String(data.activeProductCount)}
              icon={<Package size={16} />}
            />
          </div>

          <Card>
            <CardHeader title="Sales Overview" />
            <SalesTrendChart data={data.dailyTotals} />
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentSalesCard sales={data.recentSales} />
            <LowStockCard products={data.lowStockProducts} />
          </div>

          <TopProductsCard products={data.topProducts} />
        </div>
      )}
    </div>
  );
}
