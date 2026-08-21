import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "attention";
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
          {label}
        </span>
        {icon && (
          <span className={tone === "attention" ? "text-orange" : "text-text-muted"}>
            {icon}
          </span>
        )}
      </div>
      <p
        className={`mt-2 text-[24px] font-semibold tabular-nums ${
          tone === "attention" ? "text-orange-dark" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
