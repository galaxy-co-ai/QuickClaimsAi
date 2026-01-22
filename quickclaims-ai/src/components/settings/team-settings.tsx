"use client";

import { OrganizationProfile, useOrganization } from "@clerk/nextjs";
import { Users, UserPlus, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TeamSettings() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Team</h2>
          <p className="text-sm text-[var(--rr-color-stone)]">Manage your team members</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-[var(--rr-color-sand)] rounded-lg" />
          <div className="h-12 bg-[var(--rr-color-sand)] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Team</h2>
        <p className="text-sm text-[var(--rr-color-stone)]">
          Manage your organization members and their roles
        </p>
      </div>

      {/* Organization Info */}
      <div className="p-4 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
        <div className="flex items-center gap-4">
          {organization?.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name || "Organization"}
              className="h-12 w-12 rounded-lg object-cover border border-[var(--rr-color-border-default)]"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-[var(--rr-color-brand-primary)]/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[var(--rr-color-brand-primary)]" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--rr-color-text-primary)]">
              {organization?.name || "Your Organization"}
            </h3>
            <p className="text-sm text-[var(--rr-color-stone)]">
              {organization?.membersCount || 0} member
              {(organization?.membersCount || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="font-medium text-[var(--rr-color-text-primary)]">Quick Links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/estimators">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
            >
              <Users className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Manage Estimators</div>
                <div className="text-xs text-[var(--rr-color-stone)]">
                  View and edit estimator profiles
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/contractors">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
            >
              <Settings className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Manage Contractors</div>
                <div className="text-xs text-[var(--rr-color-stone)]">
                  View and edit contractor accounts
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Team Management Info */}
      <div className="p-4 rounded-lg bg-[var(--rr-color-sand-light)] border border-[var(--rr-color-border-default)]">
        <div className="flex gap-3">
          <UserPlus className="h-5 w-5 text-[var(--rr-color-text-secondary)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-[var(--rr-color-text-primary)]">
              Invite Team Members
            </h4>
            <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">
              To invite new team members or manage existing member roles, use the
              organization settings in the Clerk dashboard.
            </p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" asChild>
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Clerk Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="space-y-3">
        <h3 className="font-medium text-[var(--rr-color-text-primary)]">Role Permissions</h3>
        <div className="space-y-2">
          <div className="p-3 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--rr-color-info)]/10 text-[var(--rr-color-info)]">
                Admin
              </span>
            </div>
            <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">
              Full access to all features, settings, and team management
            </p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--rr-color-brand-primary)]/10 text-[var(--rr-color-brand-primary)]">
                Manager
              </span>
            </div>
            <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">
              Oversees assigned estimators, can view all claims, generate reports, and manage billing
            </p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--rr-color-success)]/10 text-[var(--rr-color-success)]">
                Estimator
              </span>
            </div>
            <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">
              Can manage claims, supplements, and view their own commission
            </p>
          </div>
          <div className="p-3 rounded-lg border border-[var(--rr-color-border-default)] bg-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--rr-color-warning)]/10 text-[var(--rr-color-warning)]">
                Contractor
              </span>
            </div>
            <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">
              Read-only access to their own claims and billing reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
