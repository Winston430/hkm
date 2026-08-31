import { formatCurrency, formatDayLabel } from "../../lib/format";
import type { DailyTotal } from "../../hooks/useDashboardData";

export function SalesTrendChart({ data }: { data: DailyTotal[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const lastIndex = data.length - 1;

  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((day, index) => {
        const heightPct = Math.max(4, Math.round((day.total / max) * 100));
        const isToday = index === lastIndex;
        return (
          <div
            key={day.dayStart}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-28 w-full items-end">
              <div
                className={`w-full rounded-t-[3px] ${
                  isToday ? "bg-orange" : "bg-black"
                }`}
                style={{ height: `${heightPct}%` }}
                title={formatCurrency(day.total)}
              />
            </div>
            <span className="text-[11px] text-text-muted">
              {formatDayLabel(day.dayStart)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
