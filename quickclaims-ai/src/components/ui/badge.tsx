import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--rr-radius-full)] border px-[var(--rr-space-3)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--rr-color-focus-ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--rr-color-brand-primary)] text-[var(--rr-color-text-inverse)]",
        secondary:
          "border-transparent bg-[var(--rr-color-bg-tertiary)] text-[var(--rr-color-text-primary)]",
        destructive:
          "border-transparent bg-[var(--rr-color-error)] text-[var(--rr-color-text-inverse)]",
        outline:
          "border-[var(--rr-color-border-default)] text-[var(--rr-color-text-primary)] bg-transparent",
        success:
          "border-transparent bg-[var(--rr-color-status-success-bg)] text-[var(--rr-color-status-success)]",
        warning:
          "border-transparent bg-[var(--rr-color-status-warning-bg)] text-[var(--rr-color-status-warning)]",
        error:
          "border-transparent bg-[var(--rr-color-status-error-bg)] text-[var(--rr-color-status-error)]",
        info:
          "border-transparent bg-[var(--rr-color-status-info-bg)] text-[var(--rr-color-status-info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
