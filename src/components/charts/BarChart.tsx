export interface BarChartRow {
  label: string;
  value: number;
}

export function BarChart({
  data,
  formatValue = (v) => String(v),
}: {
  data: BarChartRow[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-[12px] text-text-secondary">
            {row.label}
          </span>
          <div className="h-2 flex-1 rounded-full bg-surface-secondary">
            <div
              className="h-2 rounded-full bg-black"
              style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-[12px] tabular-nums font-medium text-text-primary">
            {formatValue(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
