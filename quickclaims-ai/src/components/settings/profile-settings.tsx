"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { User, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileSettings() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Profile</h2>
          <p className="text-sm text-[var(--rr-color-text-secondary)]">
            Manage your personal information
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 rounded-full bg-[var(--rr-color-sand)]" />
          <div className="h-4 w-48 bg-[var(--rr-color-sand)] rounded" />
          <div className="h-4 w-32 bg-[var(--rr-color-sand)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Profile</h2>
        <p className="text-sm text-[var(--rr-color-text-secondary)]">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Current Profile Info */}
      <div className="p-4 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="h-16 w-16 rounded-full object-cover border-2 border-[var(--rr-color-border-default)]"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[var(--rr-color-brand-primary)]/10 flex items-center justify-center">
                <User className="h-8 w-8 text-[var(--rr-color-brand-primary)]" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--rr-color-text-primary)] text-lg">
              {user?.fullName || "No name set"}
            </h3>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-[var(--rr-color-text-secondary)]">
                <Mail className="h-4 w-4 text-[var(--rr-color-stone)]" />
                <span>{user?.primaryEmailAddress?.emailAddress || "No email"}</span>
              </div>

              {user?.primaryPhoneNumber && (
                <div className="flex items-center gap-2 text-sm text-[var(--rr-color-text-secondary)]">
                  <Phone className="h-4 w-4 text-[var(--rr-color-stone)]" />
                  <span>{user.primaryPhoneNumber.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clerk User Profile Component */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-[var(--rr-color-text-primary)]">Account Settings</h3>
            <p className="text-sm text-[var(--rr-color-text-secondary)]">
              Update your profile, password, and security settings
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            onClick={() => {
              // Open Clerk's user profile modal
              const userButton = document.querySelector('[data-clerk-user-button-trigger]');
              if (userButton instanceof HTMLElement) {
                userButton.click();
              }
            }}
          >
            <User className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Edit Profile</div>
              <div className="text-xs text-[var(--rr-color-text-secondary)]">Update name and photo</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            asChild
          >
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Security Settings</div>
                <div className="text-xs text-[var(--rr-color-text-secondary)]">Password & 2FA</div>
              </div>
            </a>
          </Button>
        </div>

        {/* Info Note */}
        <div className="p-3 rounded-lg bg-[var(--rr-color-brand-primary)]/5 border border-[var(--rr-color-brand-primary)]/20">
          <p className="text-sm text-[var(--rr-color-brand-primary)]">
            <strong>Tip:</strong> Click your avatar in the header to access full account settings,
            including password changes and two-factor authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
