// components/charts/BarChart.tsx
export interface BarChartPoint {
  label: string;
  value: number;
}

export function BarChart({
  data,
  formatValue = (v: number) => String(v),
  height = 200,
}: {
  data: BarChartPoint[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="w-full">
      <div
        className="flex items-end justify-center gap-4"
        style={{ height }}
        role="img"
        aria-label={`Bar chart: ${data.map((d) => `${d.label} ${formatValue(d.value)}`).join(", ")}`}
      >
        {data.map((point) => {
          const barHeightPct = Math.max((Math.abs(point.value) / maxValue) * 100, 2);
          const isNegative = point.value < 0;
          return (
            <div
              key={point.label}
              className="group relative flex h-full w-full max-w-[52px] flex-col justify-end"
            >
              <div
                className={`w-full rounded-t-sm transition-[height] duration-300 ease-out ${
                  isNegative ? "bg-danger/70" : "bg-orange"
                }`}
                style={{ height: `${barHeightPct}%` }}
              />
              <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-black px-1.5 py-0.5 text-[11px] tabular-nums text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {formatValue(point.value)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center gap-4">
        {data.map((point) => (
          <div
            key={point.label}
            className="w-full max-w-[52px] truncate text-center text-[10.5px] text-text-muted"
          >
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
}