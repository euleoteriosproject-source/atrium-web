import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-navy-950/10 bg-gray-bg text-gray-text",
  accent: "border-gold-500/30 bg-gold-300/15 text-navy-950",
  dark: "border-offwhite/15 bg-offwhite/8 text-offwhite",
} as const;

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: keyof typeof variants;
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 text-caption font-bold tracking-wide uppercase",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
