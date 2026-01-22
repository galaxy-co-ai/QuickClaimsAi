"use client";

import { useState } from "react";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { updateUserPreferences } from "@/actions/settings";
import { toast } from "sonner";
import type { ThemeValue, DateFormatValue } from "@/lib/validations/settings";

interface AppearanceSettingsProps {
  preferences: {
    theme: string;
    sidebarCollapsed: boolean;
    dateFormat: string;
    claimsPerPage: number;
  } | null;
}

const themes = [
  { id: "light" as const, label: "Light", icon: Sun, description: "Light background" },
  { id: "dark" as const, label: "Dark", icon: Moon, description: "Dark background" },
  { id: "system" as const, label: "System", icon: Monitor, description: "Match device" },
];

const dateFormats = [
  { value: "MM/DD/YYYY" as const, label: "MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY" as const, label: "DD/MM/YYYY (EU)" },
  { value: "YYYY-MM-DD" as const, label: "YYYY-MM-DD (ISO)" },
];

const paginationOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

function getValidTheme(theme: string): ThemeValue {
  if (theme === "light" || theme === "dark" || theme === "system") {
    return theme;
  }
  return "system";
}

function getValidDateFormat(format: string): DateFormatValue {
  if (format === "MM/DD/YYYY" || format === "DD/MM/YYYY" || format === "YYYY-MM-DD") {
    return format;
  }
  return "MM/DD/YYYY";
}

export function AppearanceSettings({ preferences }: AppearanceSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: getValidTheme(preferences?.theme ?? "system"),
    sidebarCollapsed: preferences?.sidebarCollapsed ?? false,
    dateFormat: getValidDateFormat(preferences?.dateFormat ?? "MM/DD/YYYY"),
    claimsPerPage: preferences?.claimsPerPage ?? 20,
  });

  const handleThemeChange = (theme: ThemeValue) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserPreferences(settings);
      if (result.success) {
        toast.success("Appearance settings saved");
      }
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Appearance</h2>
        <p className="text-sm text-[var(--rr-color-stone)]">
          Customize how QuickClaims looks and feels
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[var(--rr-color-text-secondary)]">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = settings.theme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id as ThemeValue)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-[var(--rr-color-brand-primary)] bg-[var(--rr-color-brand-primary)]/10"
                    : "border-[var(--rr-color-border-default)] hover:border-[var(--rr-color-stone)] bg-white"
                )}
                aria-pressed={isSelected}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isSelected ? "text-[var(--rr-color-brand-primary)]" : "text-[var(--rr-color-stone)]"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-[var(--rr-color-brand-primary)]" : "text-[var(--rr-color-text-secondary)]"
                  )}
                >
                  {theme.label}
                </span>
                <span className="text-xs text-[var(--rr-color-stone)]">{theme.description}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--rr-color-stone)]">
          Note: Dark mode is coming soon. Currently only affects future preference.
        </p>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <label htmlFor="dateFormat" className="text-sm font-medium text-[var(--rr-color-text-secondary)]">
          Date Format
        </label>
        <Select
          value={settings.dateFormat}
          onValueChange={(value) =>
            setSettings((prev) => ({ ...prev, dateFormat: getValidDateFormat(value) }))
          }
        >
          <SelectTrigger id="dateFormat" className="w-full max-w-xs">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            {dateFormats.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Claims Per Page */}
      <div className="space-y-2">
        <label htmlFor="claimsPerPage" className="text-sm font-medium text-[var(--rr-color-text-secondary)]">
          Claims Per Page
        </label>
        <Select
          value={settings.claimsPerPage.toString()}
          onValueChange={(value) =>
            setSettings((prev) => ({ ...prev, claimsPerPage: parseInt(value) }))
          }
        >
          <SelectTrigger id="claimsPerPage" className="w-full max-w-xs">
            <SelectValue placeholder="Select pagination" />
          </SelectTrigger>
          <SelectContent>
            {paginationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sidebar Default */}
      <div className="flex items-center justify-between py-4 border-t border-[var(--rr-color-border-default)]">
        <div>
          <label
            htmlFor="sidebarCollapsed"
            className="font-medium text-[var(--rr-color-text-primary)] cursor-pointer"
          >
            Start with Sidebar Collapsed
          </label>
          <p className="text-sm text-[var(--rr-color-stone)]">
            Open the app with a minimized sidebar by default
          </p>
        </div>
        <Switch
          id="sidebarCollapsed"
          checked={settings.sidebarCollapsed}
          onCheckedChange={(checked) =>
            setSettings((prev) => ({ ...prev, sidebarCollapsed: checked }))
          }
          aria-label="Toggle sidebar collapsed by default"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[var(--rr-color-border-default)]">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
