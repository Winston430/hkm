import { useState } from "react";

export interface LineChartPoint {
  label: string;
  value: number;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 48;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

function niceMax(value: number) {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function LineChart({
  data,
  formatValue = (v) => String(v),
}: {
  data: LineChartPoint[];
  formatValue?: (value: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 0));

  const xFor = (i: number) =>
    data.length > 1 ? PAD_LEFT + (i / (data.length - 1)) * plotWidth : PAD_LEFT;
  const yFor = (v: number) => PAD_TOP + plotHeight - (v / maxValue) * plotHeight;

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.value)}`)
    .join(" ");

  const gridLines = [0, 0.5, 1];

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (relativeX - PAD_LEFT) / plotWidth;
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const lastIndex = data.length - 1;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {gridLines.map((fraction) => {
          const y = PAD_TOP + plotHeight * (1 - fraction);
          return (
            <g key={fraction}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-border-light)"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-muted"
                fontSize={10}
              >
                {formatValue(Math.round(maxValue * fraction))}
              </text>
            </g>
          );
        })}

        <path d={pathD} fill="none" stroke="var(--color-black)" strokeWidth={2} />

        {data.map((d, i) => {
          if (i !== lastIndex && i !== hoverIndex) return null;
          const isLast = i === lastIndex;
          return (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(d.value)}
              r={4}
              fill={isLast ? "var(--color-orange)" : "var(--color-black)"}
              stroke="var(--color-surface)"
              strokeWidth={1.5}
            />
          );
        })}

        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + plotHeight}
            stroke="var(--color-border)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {data.map((d, i) => {
          if (data.length > 14 && i % Math.ceil(data.length / 7) !== 0) return null;
          return (
            <text
              key={i}
              x={xFor(i)}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-text-muted"
              fontSize={10}
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          style={{
            left: `${(xFor(hoverIndex!) / WIDTH) * 100}%`,
            transform:
              hoverIndex! > data.length / 2
                ? "translateX(-100%)"
                : "translateX(0)",
          }}
        >
          <p className="font-medium text-text-primary">{hovered.label}</p>
          <p className="text-text-secondary">{formatValue(hovered.value)}</p>
        </div>
      )}
    </div>
  );
}
