// lib/reportPeriods.ts
import { buildCostLookup, saleCogs } from "./profit";
import type { Product } from "../types/product";
import type { Sale } from "../types/sale";

export type Granularity = "week" | "month" | "year";

export interface PeriodBucket {
  label: string;
  timestamp: number;
  revenue: number;
  profit: number;
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(ms: number): number {
  const d = new Date(startOfDay(ms));
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday-start week
  d.setDate(d.getDate() + diff);
  return d.getTime();
}

function startOfMonth(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function startOfYear(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), 0, 1).getTime();
}

function bucketStart(ms: number, granularity: Granularity): number {
  switch (granularity) {
    case "week":
      return startOfWeek(ms);
    case "month":
      return startOfMonth(ms);
    case "year":
      return startOfYear(ms);
  }
}

function bucketLabel(startMs: number, granularity: Granularity): string {
  const d = new Date(startMs);
  switch (granularity) {
    case "week":
      return `Wk ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    case "month":
      return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    case "year":
      return String(d.getFullYear());
  }
}

export function buildPeriodBuckets(
  sales: Sale[],
  products: Product[],
  granularity: Granularity,
): PeriodBucket[] {
  const costById = buildCostLookup(products);
  const buckets = new Map<number, { revenue: number; profit: number }>();

  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    const key = bucketStart(sale.createdAt, granularity);
    const entry = buckets.get(key) ?? { revenue: 0, profit: 0 };
    const { cogs } = saleCogs(sale, costById);
    entry.revenue += sale.totalAmount;
    entry.profit += sale.totalAmount - cogs;
    buckets.set(key, entry);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, data]) => ({
      timestamp,
      label: bucketLabel(timestamp, granularity),
      revenue: data.revenue,
      profit: data.profit,
    }));
}

/** No "day" option anymore — Today/Yesterday cover the single-day case
 *  as precise range filters instead. */
export function defaultGranularityForRangeDays(rangeDays: number | null): Granularity {
  if (rangeDays === null) return "month";
  if (rangeDays <= 90) return "week";
  if (rangeDays <= 730) return "month";
  return "year";
}