import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import {
  controlClassName,
  describedBy,
  FieldLabel,
  FieldSupportingText,
} from "./field";

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  description?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      id,
      label,
      description,
      error,
      required,
      className,
      "aria-describedby": ariaDescribedBy,
      rows = 5,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="space-y-2">
        <FieldLabel htmlFor={textareaId} required={required}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldSupportingText id={descriptionId!}>
            {description}
          </FieldSupportingText>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(
            ariaDescribedBy,
            descriptionId,
            errorId,
          )}
          className={cn(controlClassName, "min-h-36 resize-y py-4", className)}
          {...props}
        />
        {error ? (
          <FieldSupportingText id={errorId!} error>
            {error}
          </FieldSupportingText>
        ) : null}
      </div>
    );
  },
);
