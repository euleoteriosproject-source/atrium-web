import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const tones = {
  light: "text-navy-800",
  dark: "text-offwhite/80",
} as const;

export type EyebrowProps = ComponentPropsWithoutRef<"p"> & {
  tone?: keyof typeof tones;
};

export function Eyebrow({ tone = "light", className, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-eyebrow font-bold uppercase before:h-px before:w-7 before:bg-accent-strong",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
