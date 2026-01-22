import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-[var(--rr-radius-md)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] px-[var(--rr-input-padding-x)] py-[var(--rr-input-padding-y)] text-[var(--rr-input-font-size)] text-[var(--rr-color-text-primary)] placeholder:text-[var(--rr-color-text-tertiary)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring-alpha)] focus-visible:border-[var(--rr-color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--rr-color-bg-muted)] resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
