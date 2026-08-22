import { MagnifyingGlass } from "@phosphor-icons/react";
import type { InputHTMLAttributes } from "react";

export function SearchInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <MagnifyingGlass
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="text"
        className={`h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-black focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  );
}
