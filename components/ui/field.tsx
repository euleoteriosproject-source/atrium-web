import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const controlClassName =
  "motion-interactive min-h-13 w-full rounded-control border border-navy-950/20 bg-white px-4 text-body text-navy-950 shadow-[0_1px_0_rgb(11_19_32_/_0.025)] transition-[border-color,box-shadow,background-color] placeholder:text-gray-text/75 hover:border-navy-950/45 focus:border-navy-950 disabled:cursor-not-allowed disabled:bg-gray-bg disabled:text-gray-text disabled:opacity-70 aria-invalid:border-danger";

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-body-sm font-semibold text-navy-950"
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
          <span className="sr-only"> (obrigatório)</span>
        </>
      ) : null}
    </label>
  );
}

export function FieldSupportingText({
  id,
  error,
  children,
}: {
  id: string;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      role={error ? "alert" : undefined}
      className={cn("text-body-sm", error ? "text-danger" : "text-gray-text")}
    >
      {children}
    </p>
  );
}

export function describedBy(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}
