import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import {
  controlClassName,
  describedBy,
  FieldLabel,
  FieldSupportingText,
} from "./field";

export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label: string;
  description?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      label,
      description,
      error,
      required,
      className,
      children,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="space-y-2">
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldSupportingText id={descriptionId!}>
            {description}
          </FieldSupportingText>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(
              ariaDescribedBy,
              descriptionId,
              errorId,
            )}
            className={cn(controlClassName, "appearance-none pr-11", className)}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-gray-text"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error ? (
          <FieldSupportingText id={errorId!} error>
            {error}
          </FieldSupportingText>
        ) : null}
      </div>
    );
  },
);
