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
          ? "border-gold-500/30 bg-gold-300/15 text-navy-950"
          : "border-gold-300/30 bg-gold-300/10 text-gold-300",
        className,
      )}
      {...props}
    />
  );
}
