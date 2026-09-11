import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}
