// lib/dateRange.ts — new, self-contained. Reports.tsx has its own inline
// version of this same logic already; I deliberately didn't touch that
// working file to avoid re-verifying a large function unnecessarily —
// this is a reasonable future consolidation, not done here.
export type RangeMode = "today" | "yesterday" | "7" | "30" | "90" | "all" | "custom";

export const rangeOptions: { value: RangeMode; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface ResolvedRange {
  start: number | null;
  end: number;
}

export function resolveDateRange(
  mode: RangeMode,
  customFrom: string,
  customTo: string,
): ResolvedRange | null {
  const now = Date.now();
  if (mode === "today") {
    const start = startOfDay(now);
    return { start, end: start + DAY_MS - 1 };
  }
  if (mode === "yesterday") {
    const start = startOfDay(now) - DAY_MS;
    return { start, end: start + DAY_MS - 1 };
  }
  if (mode === "all") return { start: null, end: now };
  if (mode === "custom") {
    if (!customFrom || !customTo) return null;
    const start = new Date(`${customFrom}T00:00:00`).getTime();
    const end = new Date(`${customTo}T23:59:59.999`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) return null;
    return { start, end };
  }
  const days = Number(mode);
  return { start: now - days * DAY_MS, end: now };
}