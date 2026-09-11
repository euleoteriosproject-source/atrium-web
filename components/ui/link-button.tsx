import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./button";

export type LinkButtonProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
