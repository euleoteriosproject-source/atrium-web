import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const backgrounds = {
  light: "bg-offwhite text-navy-950",
  muted: "bg-gray-bg text-navy-950",
  dark: "bg-navy-950 text-offwhite",
} as const;

const spacing = {
  compact: "py-12 sm:py-16",
  default: "py-20 sm:py-24 lg:py-28",
  spacious: "py-24 sm:py-32 lg:py-40",
} as const;

export type SectionProps = ComponentPropsWithoutRef<"section"> & {
  background?: keyof typeof backgrounds;
  spacing?: keyof typeof spacing;
};

export function Section({
  background = "light",
  spacing: sectionSpacing = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        backgrounds[background],
        spacing[sectionSpacing],
        className,
      )}
      {...props}
    />
  );
}
