"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Building2,
  Shield,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, exact: true },
  { label: "Claims", href: "/dashboard/claims", icon: FileText },
  { label: "Contractors", href: "/dashboard/contractors", icon: Building2 },
  { label: "Estimators", href: "/dashboard/estimators", icon: Users },
  { label: "Carriers", href: "/dashboard/carriers", icon: Shield },
  { label: "Adjusters", href: "/dashboard/adjusters", icon: UserCheck },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/dashboard/audit", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActiveRoute = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col transition-all",
        "bg-[var(--rr-color-bg-inverse)]",
        "border-r border-[var(--rr-color-charcoal)]",
        "shadow-[var(--rr-shadow-xl)]",
        collapsed ? "w-16" : "w-[var(--rr-side-nav-width)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-[var(--rr-header-height-desktop)] items-center justify-between px-[var(--rr-space-4)] border-b border-[var(--rr-color-slate)]/20">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-[var(--rr-space-3)] group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[var(--rr-radius-lg)] bg-[var(--rr-color-brand-primary)] shadow-[var(--rr-shadow-md)] group-hover:shadow-[var(--rr-shadow-lg)] transition-shadow">
              <span className="text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)] tracking-tight">QC</span>
            </div>
            <span className="font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]/90 tracking-tight">QuickClaims</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-[var(--rr-color-text-inverse)]/40 hover:text-[var(--rr-color-text-inverse)]/80 hover:bg-[var(--rr-color-text-inverse)]/[0.06]",
            "rounded-[var(--rr-radius-lg)] transition-all",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-[var(--rr-space-3)] py-[var(--rr-space-4)] space-y-[var(--rr-space-1)]" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-[var(--rr-space-3)] rounded-[var(--rr-radius-lg)] px-[var(--rr-space-3)] py-[var(--rr-space-3)] text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] transition-all",
                isActive
                  ? [
                      "bg-[var(--rr-color-brand-primary)]/20 text-[var(--rr-color-text-inverse)]",
                      "shadow-[var(--rr-shadow-sm)]",
                    ]
                  : [
                      "text-[var(--rr-color-text-inverse)]/50 hover:text-[var(--rr-color-text-inverse)]/90",
                      "hover:bg-[var(--rr-color-text-inverse)]/[0.06]",
                    ],
                collapsed && "justify-center px-[var(--rr-space-2)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active glow effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-[var(--rr-radius-lg)] bg-gradient-to-r from-[var(--rr-color-brand-primary)]/10 via-transparent to-[var(--rr-color-brand-secondary)]/10 pointer-events-none" />
              )}

              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-transform",
                  isActive ? "text-[var(--rr-color-brand-primary)]" : "text-[var(--rr-color-text-inverse)]/50 group-hover:text-[var(--rr-color-text-inverse)]/80",
                  !isActive && "group-hover:scale-105"
                )}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className="relative">{item.label}</span>
              )}

              {/* Active indicator */}
              {isActive && !collapsed && (
                <div className="absolute right-[var(--rr-space-2)] h-1.5 w-1.5 rounded-[var(--rr-radius-full)] bg-[var(--rr-color-brand-primary)] shadow-[0_0_8px_2px_rgba(196,167,125,0.4)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-[var(--rr-space-4)] py-[var(--rr-space-4)] border-t border-[var(--rr-color-slate)]/20">
        {!collapsed && (
          <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-inverse)]/30 tracking-wide">
            QuickClaims AI
          </p>
        )}
      </div>
    </aside>
  );
}
