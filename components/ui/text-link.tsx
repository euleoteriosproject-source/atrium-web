import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  inline:
    "text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4 hover:decoration-gold-300",
  navigation:
    "text-body-sm font-semibold text-current underline decoration-transparent decoration-2 underline-offset-8 hover:decoration-gold-500",
  subtle:
    "text-body-sm text-gray-text underline decoration-navy-950/25 underline-offset-4 hover:text-navy-950 hover:decoration-gold-500",
} as const;

export type TextLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    variant?: keyof typeof variants;
  };

export function TextLink({
  variant = "inline",
  className,
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={cn(
        "motion-interactive transition-colors focus-visible:rounded-xs",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
