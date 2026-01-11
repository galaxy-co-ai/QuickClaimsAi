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
  exact?: boolean; // For routes that should only match exactly
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
        "flex h-screen flex-col transition-all duration-300 ease-out",
        "bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950",
        "backdrop-blur-xl border-r border-white/[0.08]",
        "rounded-r-2xl shadow-2xl shadow-black/20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.06]">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              <span className="text-sm font-bold text-white tracking-tight">QC</span>
            </div>
            <span className="font-semibold text-white/90 tracking-tight">QuickClaims</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-white/40 hover:text-white/80 hover:bg-white/[0.06]",
            "rounded-xl transition-all duration-200",
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
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? [
                      "bg-white/[0.12] text-white",
                      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
                      "backdrop-blur-sm",
                    ]
                  : [
                      "text-white/50 hover:text-white/90",
                      "hover:bg-white/[0.06]",
                      "hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.2)]",
                    ],
                collapsed && "justify-center px-2"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Subtle glow effect for active state */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
              )}
              
              <Icon 
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-white/50 group-hover:text-white/80",
                  !isActive && "group-hover:scale-105"
                )} 
                aria-hidden="true" 
              />
              {!collapsed && (
                <span className="relative">{item.label}</span>
              )}
              
              {/* Active indicator bar */}
              {isActive && !collapsed && (
                <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_2px_rgba(129,140,248,0.4)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        {!collapsed && (
          <p className="text-[11px] text-white/30 tracking-wide">
            © 2026 Rise Roofing
          </p>
        )}
      </div>
    </aside>
  );
}
