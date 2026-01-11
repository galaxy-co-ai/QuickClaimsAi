"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { BillingDefaults } from "@/components/settings/billing-defaults";
import { TeamSettings } from "@/components/settings/team-settings";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import type { UserRole } from "@/lib/auth";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const tabs: Tab[] = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    roles: ["admin", "manager", "estimator", "contractor"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["admin", "manager", "estimator", "contractor"],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    roles: ["admin", "manager", "estimator", "contractor"],
  },
  {
    id: "billing",
    label: "Billing Defaults",
    icon: DollarSign,
    roles: ["admin", "manager"],
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    roles: ["admin"],
  },
  {
    id: "organization",
    label: "Organization",
    icon: Building2,
    roles: ["admin"],
  },
];

interface UserPreferencesData {
  id: string;
  userId: string;
  emailStatusChanges: boolean;
  emailSupplements: boolean;
  email48HourReminders: boolean;
  emailWeeklySummary: boolean;
  theme: string;
  sidebarCollapsed: boolean;
  dateFormat: string;
  claimsPerPage: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrgSettingsData {
  id: string;
  clerkOrgId: string;
  companyName: string | null;
  logoUrl: string | null;
  primaryContactEmail: string | null;
  businessAddress: string | null;
  defaultBillingPct: number;
  defaultCommissionPct: number;
  complianceHours: number;
  reportHeader: string | null;
  reportFooter: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsClientProps {
  preferences: UserPreferencesData | null;
  orgSettings: OrgSettingsData | null;
  userRole: UserRole;
}

export function SettingsClient({
  preferences,
  orgSettings,
  userRole,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(userRole));

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings preferences={preferences} />;
      case "appearance":
        return <AppearanceSettings preferences={preferences} />;
      case "billing":
        return <BillingDefaults settings={orgSettings} />;
      case "team":
        return <TeamSettings />;
      case "organization":
        return <OrganizationSettings settings={orgSettings} />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-xl rounded-2xl">
      <div className="flex min-h-[560px]">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-slate-100/60 p-4 flex-shrink-0 rounded-l-2xl">
          <nav className="space-y-1" aria-label="Settings navigation">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? [
                          "bg-slate-900 text-white",
                          "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.25)]",
                        ]
                      : [
                          "text-slate-600 hover:text-slate-900",
                          "hover:bg-white/80 hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]",
                        ]
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Subtle glow for active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                  )}
                  <Icon 
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                      !isActive && "group-hover:scale-105"
                    )} 
                    aria-hidden="true" 
                  />
                  <span className="relative">{tab.label}</span>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_1px_rgba(129,140,248,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white/60">{renderTabContent()}</div>
      </div>
    </Card>
  );
}
