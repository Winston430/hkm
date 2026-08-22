import { formatDayLabel } from "../../lib/format";
import type { Sale } from "../../types/sale";
import type { LineChartPoint } from "../../components/charts/LineChart";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Builds a revenue-over-time series for completed sales.
 * - `windowDays` set: exactly that many daily buckets ending today.
 * - `windowDays` null ("all time"): daily buckets if the data spans <= 120
 *   days, otherwise weekly buckets, so the chart never renders thousands
 *   of points for a long-lived shop.
 */
export function buildRevenueSeries(
  sales: Sale[],
  windowDays: number | null,
): LineChartPoint[] {
  const completed = sales.filter((s) => s.status === "completed");
  const todayStart = startOfDay(Date.now());

  if (windowDays !== null) {
    return Array.from({ length: windowDays }, (_, i) => {
      const bucketStart = todayStart - (windowDays - 1 - i) * DAY_MS;
      const bucketEnd = bucketStart + DAY_MS;
      const total = completed
        .filter((s) => s.createdAt >= bucketStart && s.createdAt < bucketEnd)
        .reduce((sum, s) => sum + s.totalAmount, 0);
      return { label: formatDayLabel(bucketStart), value: total };
    });
  }

  if (completed.length === 0) return [];

  const earliest = startOfDay(Math.min(...completed.map((s) => s.createdAt)));
  const spanDays = Math.max(1, Math.round((todayStart - earliest) / DAY_MS) + 1);
  const useWeekly = spanDays > 120;
  const bucketMs = useWeekly ? 7 * DAY_MS : DAY_MS;
  const bucketCount = Math.ceil(spanDays / (useWeekly ? 7 : 1));

  return Array.from({ length: bucketCount }, (_, i) => {
    const bucketStart = earliest + i * bucketMs;
    const bucketEnd = bucketStart + bucketMs;
    const total = completed
      .filter((s) => s.createdAt >= bucketStart && s.createdAt < bucketEnd)
      .reduce((sum, s) => sum + s.totalAmount, 0);
    return { label: formatDayLabel(bucketStart), value: total };
  });
}
