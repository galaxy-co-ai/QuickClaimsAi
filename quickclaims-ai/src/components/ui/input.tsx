import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[var(--rr-input-height)] w-full rounded-[var(--rr-radius-md)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] px-[var(--rr-input-padding-x)] py-[var(--rr-input-padding-y)] text-[var(--rr-input-font-size)] text-[var(--rr-color-text-primary)] placeholder:text-[var(--rr-color-text-tertiary)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring-alpha)] focus-visible:border-[var(--rr-color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--rr-color-bg-muted)] file:border-0 file:bg-transparent file:text-[var(--rr-font-size-sm)] file:font-[var(--rr-font-weight-medium)] file:text-[var(--rr-color-text-primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
