// pages/reports/Reports.tsx
import { useEffect, useMemo, useState } from "react";
import { DownloadSimple, WarningCircle } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { useReportsData } from "../../hooks/useReportsData";
import { exportToCsv } from "../../lib/exportCsv";
import { formatDayLabel, formatTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import { calculateProfitSummary, buildCostLookup, saleCogs } from "../../lib/profit";
import {
  buildPeriodBuckets,
  defaultGranularityForRangeDays,
  startOfDay,
  type Granularity,
} from "../../lib/reportPeriods";
import { listAllExpenses } from "../../services/expenses";
import type { Expense } from "../../types/expense";
import { SalesReportCard } from "./SalesReportCard";
import { InventoryReportCard } from "./InventoryReportCard";
import { ProductPerformanceCard } from "./ProductPerformanceCard";
import { AgentPerformanceCard } from "./AgentPerformanceCard";
import { RevenueTrendCard } from "./RevenueTrendCard";
import { ProfitTrendCard } from "./ProfitTrendCard";
import { ProfitReportCard } from "./ProfitReportCard";
import { InsightsCard } from "./InsightsCard";
import { generateInsights } from "./insights";
import { ReportsSkeleton } from "./ReportsSkeleton";
import type { LineChartPoint } from "../../components/charts/LineChart";

const DAY_MS = 24 * 60 * 60 * 1000;

// Caps how many bars the Profit chart renders — a wide range grouped
// into many periods would otherwise squeeze bars down to slivers.
// Revenue Trend (a line chart) doesn't have this problem, so it isn't
// capped and always reflects the full selected range.
const MAX_PROFIT_CHART_PERIODS = 5;

type RangeMode = "today" | "yesterday" | "7" | "30" | "90" | "all" | "custom";

const rangeOptions: { value: RangeMode; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

// "Daily" was intentionally removed — Today/Yesterday now cover the
// single-day case as precise range filters instead of a grouping option.
const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

function buildExportFilename(rangeLabel: string): string {
  const rangeSlug = rangeLabel.toLowerCase().replace(/\s+/g, "-");
  const dateSlug = new Date().toISOString().slice(0, 10);
  return `sales-report-${rangeSlug}-${dateSlug}`;
}

export function Reports() {
  const { status, sales, products } = useReportsData();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rangeMode, setRangeMode] = useState<RangeMode>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("week");

  // Loaded independently of useReportsData — that hook doesn't know
  // about expenses, and I don't have its source to safely extend.
  useEffect(() => {
    listAllExpenses()
      .then(setExpenses)
      .catch(() => {
        toast.error("Unable to load expenses — Net Profit may be incomplete.");
      });
  }, []);

  const resolvedRange = useMemo<{ start: number | null; end: number } | null>(() => {
    const now = Date.now();

    if (rangeMode === "today") {
      const start = startOfDay(now);
      return { start, end: start + DAY_MS - 1 };
    }
    if (rangeMode === "yesterday") {
      const start = startOfDay(now) - DAY_MS;
      return { start, end: start + DAY_MS - 1 };
    }
    if (rangeMode === "all") return { start: null, end: now };
    if (rangeMode === "custom") {
      if (!customFrom || !customTo) return null;
      const start = new Date(`${customFrom}T00:00:00`).getTime();
      const end = new Date(`${customTo}T23:59:59.999`).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) return null;
      return { start, end };
    }
    const days = Number(rangeMode);
    return { start: now - days * DAY_MS, end: now };
  }, [rangeMode, customFrom, customTo]);

  const customRangeInvalid =
    rangeMode === "custom" && customFrom !== "" && customTo !== "" && !resolvedRange;

  const rangeDays = resolvedRange?.start
    ? Math.ceil((resolvedRange.end - resolvedRange.start) / DAY_MS)
    : null;

  // Re-picks a sensible granularity whenever the range selection itself
  // changes — not on every render — so a manual override survives until
  // the person picks a different range.
  useEffect(() => {
    setGranularity(defaultGranularityForRangeDays(rangeDays));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeMode, customFrom, customTo]);

  const scopedSales = useMemo(() => {
    if (!resolvedRange) return [];
    const { start, end } = resolvedRange;
    return sales.filter((s) => s.createdAt <= end && (start === null || s.createdAt >= start));
  }, [sales, resolvedRange]);

  const previousPeriodSales = useMemo(() => {
    if (!resolvedRange || resolvedRange.start === null) return null;
    const { start, end } = resolvedRange;
    const length = end - start;
    return sales.filter((s) => s.createdAt >= start - length && s.createdAt < start);
  }, [sales, resolvedRange]);

  const scopedExpenses = useMemo(() => {
    if (!resolvedRange) return [];
    const { start, end } = resolvedRange;
    return expenses.filter((e) => e.date <= end && (start === null || e.date >= start));
  }, [expenses, resolvedRange]);

  const totalExpenses = useMemo(
    () => scopedExpenses.reduce((sum, e) => sum + e.amount, 0),
    [scopedExpenses],
  );

  const periodBuckets = useMemo(
    () => buildPeriodBuckets(scopedSales, products, granularity),
    [scopedSales, products, granularity],
  );

  // Assumes LineChartPoint is { label: string; value: number } — the
  // shape RevenueTrendCard's formatValue usage implies. Send LineChart.tsx
  // if that's wrong; only this mapping line would need to change.
  const revenueSeries: LineChartPoint[] = useMemo(
    () => periodBuckets.map((b) => ({ label: b.label, value: b.revenue })),
    [periodBuckets],
  );

  const profitSeries = useMemo(
    () =>
      periodBuckets
        .slice(-MAX_PROFIT_CHART_PERIODS) // most recent N periods only
        .map((b) => ({ label: b.label, value: b.profit })),
    [periodBuckets],
  );

  const profitSummary = useMemo(
    () => calculateProfitSummary(scopedSales, products),
    [scopedSales, products],
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
    const costById = buildCostLookup(products);
    const rangeLabel =
      rangeMode === "custom"
        ? `${customFrom}-to-${customTo}`
        : rangeOptions.find((o) => o.value === rangeMode)!.label;

    exportToCsv(
      buildExportFilename(rangeLabel),
      scopedSales.map((sale) => {
        const { cogs } = saleCogs(sale, costById);
        const isCompleted = sale.status === "completed";
        return {
          Invoice: sale.invoiceNumber,
          Date: formatDayLabel(sale.createdAt),
          Time: formatTime(sale.createdAt),
          Agent: sale.agentName,
          Items: sale.items.length,
          Amount: sale.totalAmount,
          Cost: isCompleted ? cogs : 0,
          Profit: isCompleted ? sale.totalAmount - cogs : 0,
          Payment: sale.paymentMethod,
          Status: sale.status,
        };
      }),
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Business performance based on your recorded data"
        action={
          <>
            <div className="w-full max-w-[160px]">
              <Select
                value={rangeMode}
                onChange={(e) => setRangeMode(e.target.value as RangeMode)}
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
              disabled={status !== "success" || !resolvedRange || scopedSales.length === 0}
            >
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        {rangeMode === "custom" && (
          <>
            <div className="w-full max-w-[160px]">
              <Input
                type="date"
                label="From"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-full max-w-[160px]">
              <Input
                type="date"
                label="To"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="w-full max-w-[150px]">
          <Select
            label="Group by"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
          >
            {granularityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {customRangeInvalid && (
        <Card className="mb-6">
          <p role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            The "From" date must be on or before the "To" date.
          </p>
        </Card>
      )}

      {rangeMode === "custom" && (!customFrom || !customTo) && (
        <Card className="mb-6">
          <p className="text-[13px] text-text-secondary">
            Pick both a "From" and "To" date to view this report.
          </p>
        </Card>
      )}

      {status === "loading" && <ReportsSkeleton />}

      {status === "error" && (
        <Card>
          <ErrorState title="Unable to load reports" />
        </Card>
      )}

      {status === "success" && resolvedRange && (
        <div className="flex flex-col gap-6">
          <SalesReportCard sales={scopedSales} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueTrendCard series={revenueSeries} />
            <ProfitTrendCard data={profitSeries} />
          </div>

          <ProfitReportCard summary={profitSummary} totalExpenses={totalExpenses} />

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