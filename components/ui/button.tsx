import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = {
  primary:
    "overflow-hidden border-navy-950 bg-navy-950 text-offwhite before:absolute before:inset-y-[-1px] before:left-[-1px] before:w-1 before:bg-gold-500 before:content-[''] hover:border-navy-800 hover:bg-navy-800 hover:before:bg-gold-300 active:translate-y-0 active:bg-navy-950",
  accent:
    "border-gold-500 bg-gold-500 text-navy-950 hover:border-gold-300 hover:bg-gold-300 active:border-gold-500 active:bg-gold-500 focus-visible:outline-gold-300",
  outlineDark:
    "border-offwhite/35 bg-transparent text-offwhite hover:border-offwhite hover:bg-offwhite/8 hover:text-offwhite active:border-offwhite/75 active:bg-offwhite/12 focus-visible:outline-gold-300",
  secondary:
    "border-navy-950/25 bg-transparent text-navy-950 hover:border-navy-950 hover:bg-navy-950 hover:text-offwhite",
  ghost: "border-transparent bg-transparent text-navy-950 hover:bg-navy-950/5",
  text: "border-transparent bg-transparent text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4 hover:decoration-gold-300",
} as const;

export const buttonSizes = {
  sm: "min-h-11 px-4 text-body-sm",
  md: "min-h-13 px-6 text-body",
  lg: "min-h-15 px-8 text-body",
} as const;

const textButtonSizes = {
  sm: "min-h-11 px-0 text-body-sm",
  md: "min-h-12 px-0 text-body",
  lg: "min-h-14 px-0 text-body",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "motion-interactive relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-semibold transition-[color,background-color,border-color,transform] hover:-translate-y-px focus-visible:outline-offset-4 active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
    buttonVariants[variant],
    variant === "text" ? textButtonSizes[size] : buttonSizes[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingLabel = "Carregando",
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClassName({ variant, size, className })}
        {...props}
      >
        <span
          aria-hidden={loading || undefined}
          className={cn(loading && "invisible")}
        >
          {children}
        </span>
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span className="sr-only">{loadingLabel}</span>
          </span>
        ) : null}
      </button>
    );
  },
);
