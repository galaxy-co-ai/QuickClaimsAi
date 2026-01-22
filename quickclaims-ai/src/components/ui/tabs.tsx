"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-[var(--rr-button-height-md)] items-center justify-center rounded-[var(--rr-radius-lg)] bg-[var(--rr-color-bg-tertiary)] p-[var(--rr-space-1)] text-[var(--rr-color-text-tertiary)]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--rr-radius-md)] px-[var(--rr-space-3)] py-[var(--rr-space-2)] text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-[var(--rr-color-bg-secondary)] data-[state=active]:text-[var(--rr-color-text-primary)] data-[state=active]:shadow-[var(--rr-shadow-sm)]",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-[var(--rr-space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-focus-ring)] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
