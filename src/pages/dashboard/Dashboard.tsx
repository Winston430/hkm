// pages/dashboard/Dashboard.tsx
import { Receipt, Package, WarningCircle, Stack } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/format";
import { getTimeGreeting, getFirstName } from "../../lib/greeting";
import { MetricCard } from "../../components/ui/MetricCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { RecentSalesCard } from "./RecentSalesCard";
import { LowStockCard } from "./LowStockCard";
import { TopProductsCard } from "./TopProductsCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function Dashboard() {
  const { status, data, reload } = useDashboardData();
  const { profile } = useAuth();

  const firstName = getFirstName(profile?.name); // swap `name` for your actual AppUser field
  const greeting = firstName ? `${getTimeGreeting()}, ${firstName}` : getTimeGreeting();
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div>
      {/* Topbar wayfinding — stays "Dashboard" on every visit, same as every other page */}
      <PageHeader title="Dashboard" description="Business overview for today" />

      {/* Page content — the personalized part lives here, not in the topbar */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">
          {greeting}
        </h1>
        <p className="mt-0.5 text-[13px] text-text-muted">{today}</p>
      </div>

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