import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { describedBy, FieldSupportingText } from "./field";

export type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  description?: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      label,
      description,
      error,
      required,
      disabled,
      className,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex min-h-13 cursor-pointer items-start gap-3 rounded-control px-2 py-3 text-body-sm text-navy-950",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(
              ariaDescribedBy,
              descriptionId,
              errorId,
            )}
            className={cn(
              "mt-0.5 size-5 shrink-0 cursor-pointer rounded border-navy-950/30 text-navy-950 accent-navy-950 focus-visible:outline-offset-3 disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
          <span>
            <span className="font-semibold">
              {label}
              {required ? (
                <>
                  <span aria-hidden="true" className="ml-1 text-danger">
                    *
                  </span>
                  <span className="sr-only"> (obrigatório)</span>
                </>
              ) : null}
            </span>
            {description ? (
              <span id={descriptionId} className="mt-1 block text-gray-text">
                {description}
              </span>
            ) : null}
          </span>
        </label>
        {error ? (
          <FieldSupportingText id={errorId!} error>
            {error}
          </FieldSupportingText>
        ) : null}
      </div>
    );
  },
);
