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
    <Card className="overflow-hidden shadow-lg border-slate-200">
      <div className="flex min-h-[560px]">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r border-slate-200 bg-slate-50 p-4 flex-shrink-0">
          <nav className="space-y-1" aria-label="Settings navigation">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">{renderTabContent()}</div>
      </div>
    </Card>
  );
}
