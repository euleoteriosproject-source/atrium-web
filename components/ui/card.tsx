import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const tones = {
  light: "border-navy-950/12 bg-offwhite text-navy-950",
  dark: "border-navy-800 bg-navy-800 text-offwhite",
} as const;

export type CardProps = ComponentPropsWithoutRef<"div"> & {
  tone?: keyof typeof tones;
};

export function Card({ tone = "light", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border p-7 shadow-card sm:p-9",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cn("text-h4 font-semibold", className)} {...props} />;
}

export function CardDescription({
  tone = "light",
  className,
  ...props
}: ComponentPropsWithoutRef<"p"> & { tone?: keyof typeof tones }) {
  return (
    <p
      className={cn(
        "text-body",
        tone === "light" ? "text-gray-text" : "text-offwhite/70",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-6 flex items-center", className)} {...props} />;
}
