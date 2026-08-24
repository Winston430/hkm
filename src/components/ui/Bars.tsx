// components/ui/Bars.tsx
import type { ComponentProps } from "react";

interface BarsProps extends ComponentProps<"span"> {
  bars?: number;
}

/** Animated loading bars. Caller must set a height (e.g. h-8) and a text
 *  color via className — bars render with bg-current and have no
 *  default size or color of their own. */
export function Bars({ className, bars = 3, ...props }: BarsProps) {
  return (
    <span
      role="status"
      className={["inline-flex items-stretch gap-[5%]", className].filter(Boolean).join(" ")}
      {...props}
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="inline-block h-full rounded-[1px] bg-current"
          style={{
            width: `${100 / bars}%`,
            animation: "bars-wave var(--duration, 1.2s) ease-in-out infinite",
            animationDelay: `calc(var(--delay, 0.2s) * ${index})`,
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </span>
  );
}