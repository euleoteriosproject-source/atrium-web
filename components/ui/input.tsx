import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import {
  controlClassName,
  describedBy,
  FieldLabel,
  FieldSupportingText,
} from "./field";

export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "size"> & {
  label: string;
  description?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    description,
    error,
    required,
    className,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={inputId} required={required}>
        {label}
      </FieldLabel>
      {description ? (
        <FieldSupportingText id={descriptionId!}>
          {description}
        </FieldSupportingText>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ariaDescribedBy, descriptionId, errorId)}
        className={cn(controlClassName, className)}
        {...props}
      />
      {error ? (
        <FieldSupportingText id={errorId!} error>
          {error}
        </FieldSupportingText>
      ) : null}
    </div>
  );
});
