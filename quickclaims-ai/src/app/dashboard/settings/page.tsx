export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth";
import { getUserPreferences, getOrganizationSettings } from "@/actions/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/sign-in");
  }

  const isAdmin = role === "admin";

  const [preferences, orgSettings] = await Promise.all([
    getUserPreferences(),
    isAdmin ? getOrganizationSettings() : Promise.resolve(null),
  ]);

  return (
    <div className="flex items-start justify-center py-4">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">
            Manage your account and application preferences
          </p>
        </div>

        <SettingsClient
          preferences={preferences}
          orgSettings={orgSettings}
          userRole={role}
        />
      </div>
    </div>
  );
}
