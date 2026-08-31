import type { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "orange";

const variantClasses: Record<Variant, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  orange: "bg-orange-light text-orange-dark",
  neutral: "bg-surface-secondary text-text-secondary",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[11px] font-medium leading-4 ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
