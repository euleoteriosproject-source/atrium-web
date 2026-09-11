import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { Eyebrow } from "./eyebrow";

export type SectionHeaderProps = ComponentPropsWithoutRef<"header"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className={cn("text-h2 font-semibold", eyebrow && "mt-4")}>
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-body-lg text-gray-text">{description}</p>
      ) : null}
    </header>
  );
}
