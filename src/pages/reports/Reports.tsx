// pages/reports/Reports.tsx
import { useMemo, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { useReportsData } from "../../hooks/useReportsData";
import { exportToCsv } from "../../lib/exportCsv";
import { formatDayLabel, formatTime } from "../../lib/format";
import { SalesReportCard } from "./SalesReportCard";
import { InventoryReportCard } from "./InventoryReportCard";
import { ProductPerformanceCard } from "./ProductPerformanceCard";
import { AgentPerformanceCard } from "./AgentPerformanceCard";
import { RevenueTrendCard } from "./RevenueTrendCard";
import { InsightsCard } from "./InsightsCard";
import { generateInsights } from "./insights";
import { buildRevenueSeries } from "./series";
import { ReportsSkeleton } from "./ReportsSkeleton";

const DAY_MS = 24 * 60 * 60 * 1000;

const rangeOptions = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

function buildExportFilename(rangeValue: string): string {
  const option = rangeOptions.find((o) => o.value === rangeValue);
  const rangeSlug = option
    ? option.label.toLowerCase().replace(/\s+/g, "-")
    : "custom-range";
  const dateSlug = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `sales-report-${rangeSlug}-${dateSlug}`;
}

export function Reports() {
  const { status, sales, products } = useReportsData();
  const [range, setRange] = useState("30");

  const windowDays = range === "all" ? null : Number(range);

  // Computed once and shared by both filters below, instead of each
  // recomputing Date.now() independently.
  const periodCutoffs = useMemo(() => {
    if (windowDays === null) return null;
    const cutoff = Date.now() - windowDays * DAY_MS;
    const previousCutoff = cutoff - windowDays * DAY_MS;
    return { cutoff, previousCutoff };
  }, [windowDays]);

  const scopedSales = useMemo(() => {
    if (!periodCutoffs) return sales;
    return sales.filter((s) => s.createdAt >= periodCutoffs.cutoff);
  }, [sales, periodCutoffs]);

  const previousPeriodSales = useMemo(() => {
    if (!periodCutoffs) return null;
    return sales.filter(
      (s) =>
        s.createdAt >= periodCutoffs.previousCutoff &&
        s.createdAt < periodCutoffs.cutoff,
    );
  }, [sales, periodCutoffs]);

  const revenueSeries = useMemo(
    () => buildRevenueSeries(scopedSales, windowDays),
    [scopedSales, windowDays],
  );

  const insights = useMemo(
    () =>
      generateInsights({
        currentSales: scopedSales,
        previousSales: previousPeriodSales,
        products,
      }),
    [scopedSales, previousPeriodSales, products],
  );

  function handleExport() {
    exportToCsv(
      buildExportFilename(range),
      scopedSales.map((sale) => ({
        Invoice: sale.invoiceNumber,
        Date: formatDayLabel(sale.createdAt),
        Time: formatTime(sale.createdAt),
        Agent: sale.agentName,
        Items: sale.items.length,
        Amount: sale.totalAmount,
        Payment: sale.paymentMethod,
        Status: sale.status,
      })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Business performance based on your recorded data"
        action={
          <>
            <div className="w-full max-w-[170px]">
              <Select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                aria-label="Date range"
              >
                {rangeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="secondary"
              icon={<DownloadSimple size={15} />}
              onClick={handleExport}
              disabled={status !== "success" || scopedSales.length === 0}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {status === "loading" && <ReportsSkeleton />}

      {status === "error" && (
        <Card>
          <ErrorState title="Unable to load reports" />
          {/* No retry wired here — useReportsData() doesn't currently
              expose a reload/refetch function. Add one and pass it as
              onRetry, matching Products/Categories/Record Sale. */}
        </Card>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-6">
          <SalesReportCard sales={scopedSales} />
          <RevenueTrendCard series={revenueSeries} />
          <InsightsCard insights={insights} />
          <InventoryReportCard products={products} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductPerformanceCard sales={scopedSales} />
            <AgentPerformanceCard sales={scopedSales} />
          </div>
        </div>
      )}
    </div>
  );
}