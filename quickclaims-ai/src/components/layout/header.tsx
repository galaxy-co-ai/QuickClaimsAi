"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search claims..."
            className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
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
          <Bell className="h-5 w-5 text-slate-600" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* Organization Switcher */}
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "flex items-center",
              organizationSwitcherTrigger: "rounded-lg border border-slate-200 px-3 py-1.5",
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
