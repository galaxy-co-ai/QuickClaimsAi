"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  return (
    <header className="flex h-[var(--rr-header-height-desktop)] items-center justify-between border-b border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] px-[var(--rr-space-6)]">
      <div className="flex items-center gap-[var(--rr-space-4)]">
        <h1 className="text-[var(--rr-font-size-xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-primary)]">{title}</h1>
      </div>

      <div className="flex items-center gap-[var(--rr-space-4)]">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-[var(--rr-space-3)] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rr-color-text-tertiary)]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search claims..."
            className="h-[var(--rr-button-height-sm)] w-64 rounded-[var(--rr-radius-md)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-tertiary)] pl-9 pr-[var(--rr-space-4)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-primary)] outline-none transition-all placeholder:text-[var(--rr-color-text-tertiary)] focus:border-[var(--rr-color-border-focus)] focus:bg-[var(--rr-color-bg-secondary)] focus:ring-2 focus:ring-[var(--rr-color-focus-ring-alpha)]"
            aria-label="Search claims"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--rr-color-text-secondary)]" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-[var(--rr-radius-full)] bg-[var(--rr-color-error)]" />
        </Button>

        {/* Organization Switcher */}
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "flex items-center",
              organizationSwitcherTrigger: "rounded-[var(--rr-radius-md)] border border-[var(--rr-color-border-default)] px-[var(--rr-space-3)] py-[var(--rr-space-2)] text-[var(--rr-color-text-primary)] hover:bg-[var(--rr-color-surface-hover)] transition-colors",
            },
          }}
        />

        {/* User Menu */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
}
