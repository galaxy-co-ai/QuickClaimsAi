"use client";

import { useState } from "react";
import { Bell, Mail, Clock, BarChart3, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateUserPreferences } from "@/actions/settings";
import { toast } from "sonner";

interface NotificationSettingsProps {
  preferences: {
    emailStatusChanges: boolean;
    emailSupplements: boolean;
    email48HourReminders: boolean;
    emailWeeklySummary: boolean;
  } | null;
}

export function NotificationSettings({ preferences }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailStatusChanges: preferences?.emailStatusChanges ?? true,
    emailSupplements: preferences?.emailSupplements ?? true,
    email48HourReminders: preferences?.email48HourReminders ?? true,
    emailWeeklySummary: preferences?.emailWeeklySummary ?? false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserPreferences(settings);
      if (result.success) {
        toast.success("Notification preferences saved");
      }
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: "emailStatusChanges" as const,
      icon: Bell,
      label: "Status Change Emails",
      description: "Receive an email when a claim status changes",
    },
    {
      key: "emailSupplements" as const,
      icon: Mail,
      label: "Supplement Notifications",
      description: "Get notified when supplements are approved or denied",
    },
    {
      key: "email48HourReminders" as const,
      icon: Clock,
      label: "48-Hour Reminders",
      description: "Daily digest of claims approaching or past the 48-hour update window",
    },
    {
      key: "emailWeeklySummary" as const,
      icon: BarChart3,
      label: "Weekly Summary",
      description: "Receive a weekly performance summary every Monday",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Notifications</h2>
        <p className="text-sm text-[var(--rr-color-stone)]">
          Choose which email notifications you&apos;d like to receive
        </p>
      </div>

      {/* Notification Toggles */}
      <div className="space-y-1">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.key}
              className="flex items-center justify-between py-4 border-b border-[var(--rr-color-border-default)] last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-[var(--rr-color-sand)]">
                  <Icon className="h-4 w-4 text-[var(--rr-color-text-secondary)]" />
                </div>
                <div>
                  <label
                    htmlFor={option.key}
                    className="font-medium text-[var(--rr-color-text-primary)] cursor-pointer"
                  >
                    {option.label}
                  </label>
                  <p className="text-sm text-[var(--rr-color-stone)]">{option.description}</p>
                </div>
              </div>
              <Switch
                id={option.key}
                checked={settings[option.key]}
                onCheckedChange={() => handleToggle(option.key)}
                aria-label={`Toggle ${option.label}`}
              />
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[var(--rr-color-border-default)]">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Info Note */}
      <div className="p-3 rounded-lg bg-[var(--rr-color-warning)]/10 border border-[var(--rr-color-warning)]/20">
        <p className="text-sm text-[var(--rr-color-warning)]">
          <strong>Note:</strong> Email notifications require a valid email address
          and may take a few minutes to take effect.
        </p>
      </div>
    </div>
  );
}
