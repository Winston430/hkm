import type { SelectHTMLAttributes } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, id, className = "", children, ...rest }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-[12px] font-medium text-text-secondary">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          id={id}
          className={`h-9 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-8 text-[13px] text-text-primary focus:border-black focus:outline-none ${className}`}
          {...rest}
        >
          {children}
        </select>
        <CaretDown
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </label>
  );
}
