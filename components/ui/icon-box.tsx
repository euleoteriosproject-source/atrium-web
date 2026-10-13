import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type IconBoxProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "light" | "dark";
};

export function IconBox({ tone = "light", className, ...props }: IconBoxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-control border",
        tone === "light"
          ? "border-brand-blue/30 bg-accent-soft text-brand-navy"
          : "border-brand-cyan/30 bg-brand-cyan/10 text-accent-on-dark",
        className,
      )}
      {...props}
    />
  );
}
