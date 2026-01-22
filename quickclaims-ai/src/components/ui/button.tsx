import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--rr-color-brand-primary)] text-[var(--rr-color-text-inverse)] shadow-[var(--rr-shadow-sm)] hover:bg-[var(--rr-color-brand-primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)] focus-visible:ring-offset-2",
        destructive:
          "bg-[var(--rr-color-error)] text-[var(--rr-color-text-inverse)] shadow-[var(--rr-shadow-sm)] hover:bg-[var(--rr-color-error)]/90 focus-visible:ring-2 focus-visible:ring-[var(--rr-color-error)]",
        outline:
          "border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] text-[var(--rr-color-text-primary)] shadow-[var(--rr-shadow-sm)] hover:bg-[var(--rr-color-surface-hover)] hover:border-[var(--rr-color-border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)]",
        secondary:
          "bg-[var(--rr-color-bg-tertiary)] text-[var(--rr-color-text-primary)] shadow-[var(--rr-shadow-sm)] hover:bg-[var(--rr-color-surface-active)] focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)]",
        ghost:
          "text-[var(--rr-color-text-primary)] hover:bg-[var(--rr-color-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)]",
        link:
          "text-[var(--rr-color-text-link)] underline-offset-4 hover:underline hover:text-[var(--rr-color-text-link-hover)]",
        success:
          "bg-[var(--rr-color-success)] text-[var(--rr-color-text-inverse)] shadow-[var(--rr-shadow-sm)] hover:bg-[var(--rr-color-success)]/90 focus-visible:ring-2 focus-visible:ring-[var(--rr-color-success)]",
      },
      size: {
        default: "h-[var(--rr-button-height-md)] px-[var(--rr-button-padding-x-md)] text-[var(--rr-font-size-base)] rounded-[var(--rr-radius-md)] [&_svg]:size-5",
        sm: "h-[var(--rr-button-height-sm)] px-[var(--rr-button-padding-x-sm)] text-[var(--rr-font-size-sm)] rounded-[var(--rr-radius-md)] [&_svg]:size-4",
        lg: "h-[var(--rr-button-height-lg)] px-[var(--rr-button-padding-x-lg)] text-[var(--rr-font-size-lg)] rounded-[var(--rr-radius-lg)] [&_svg]:size-6",
        icon: "h-[var(--rr-icon-button-size-md)] w-[var(--rr-icon-button-size-md)] rounded-[var(--rr-radius-md)] [&_svg]:size-[var(--rr-icon-size-md)]",
        "icon-sm": "h-[var(--rr-icon-button-size-sm)] w-[var(--rr-icon-button-size-sm)] rounded-[var(--rr-radius-md)] [&_svg]:size-[var(--rr-icon-size-sm)]",
        "icon-lg": "h-[var(--rr-icon-button-size-lg)] w-[var(--rr-icon-button-size-lg)] rounded-[var(--rr-radius-lg)] [&_svg]:size-[var(--rr-icon-size-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
