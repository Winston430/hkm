import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...rest }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-[12px] font-medium text-text-secondary">
          {label}
        </span>
      )}
      <input
        id={id}
        className={`h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-black focus:outline-none ${className}`}
        {...rest}
      />
    </label>
  );
}
