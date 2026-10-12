import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type ProgressProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  value: number;
  max?: number;
  label: string;
  valueText?: string;
};

export function Progress({
  value,
  max = 100,
  label,
  valueText,
  className,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between gap-4 text-body-sm font-semibold">
        <span>{label}</span>
        {valueText ? <span className="text-gray-text">{valueText}</span> : null}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={valueText}
        className="h-1.5 overflow-hidden rounded-full bg-navy-950/10"
      >
        <div
          aria-hidden="true"
          className="motion-section h-full rounded-full bg-accent-strong transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
