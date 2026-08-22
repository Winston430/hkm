import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "orange" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-black text-white border border-black hover:bg-black-soft disabled:bg-text-disabled disabled:border-text-disabled",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-surface-secondary disabled:text-text-disabled",
  orange:
    "bg-orange text-white border border-orange hover:bg-orange-dark disabled:bg-text-disabled disabled:border-text-disabled",
  ghost:
    "bg-transparent text-text-primary border border-transparent hover:bg-surface-secondary",
  danger:
    "bg-danger text-white border border-danger hover:bg-danger disabled:bg-text-disabled disabled:border-text-disabled",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-[13px] gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-75 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
