"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole, getCurrentDbUserId, getCurrentOrgId } from "@/lib/auth";
import {
  updateUserPreferencesSchema,
  updateOrganizationSettingsSchema,
  type UpdateUserPreferencesInput,
  type UpdateOrganizationSettingsInput,
} from "@/lib/validations/settings";

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Get the current user's preferences
 */
export async function getUserPreferences() {
  const userId = await getCurrentDbUserId();

  if (!userId) {
    return null;
  }

  const preferences = await db.userPreferences.findUnique({
    where: { userId },
  });

  // Return defaults if no preferences exist yet
  if (!preferences) {
    return {
      id: "",
      userId,
      emailStatusChanges: true,
      emailSupplements: true,
      email48HourReminders: true,
      emailWeeklySummary: false,
      theme: "system" as const,
      sidebarCollapsed: false,
      dateFormat: "MM/DD/YYYY" as const,
      claimsPerPage: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return preferences;
}

/**
 * Update the current user's preferences
 */
export async function updateUserPreferences(data: UpdateUserPreferencesInput) {
  const userId = await getCurrentDbUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Validate input
  const validated = updateUserPreferencesSchema.parse(data);

  // Upsert preferences (create if not exists, update if exists)
  const preferences = await db.userPreferences.upsert({
    where: { userId },
    update: validated,
    create: {
      userId,
      ...validated,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, preferences };
}

// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

/**
 * Get the current organization's settings (admin only)
 */
export async function getOrganizationSettings() {
  await requireRole(["admin"]);

  const orgId = await getCurrentOrgId();

  if (!orgId) {
    return null;
  }

  const settings = await db.organizationSettings.findUnique({
    where: { clerkOrgId: orgId },
  });

  // Return defaults if no settings exist yet
  if (!settings) {
    return {
      id: "",
      clerkOrgId: orgId,
      companyName: null,
      logoUrl: null,
      primaryContactEmail: null,
      businessAddress: null,
      defaultBillingPct: 0.125,
      defaultCommissionPct: 0.05,
      complianceHours: 48,
      reportHeader: null,
      reportFooter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Convert Decimal to number for client consumption
  return {
    ...settings,
    defaultBillingPct: settings.defaultBillingPct.toNumber(),
    defaultCommissionPct: settings.defaultCommissionPct.toNumber(),
  };
}

/**
 * Update the current organization's settings (admin only)
 */
export async function updateOrganizationSettings(data: UpdateOrganizationSettingsInput) {
  await requireRole(["admin"]);

  const orgId = await getCurrentOrgId();

  if (!orgId) {
    throw new Error("No organization selected");
  }

  // Validate input
  const validated = updateOrganizationSettingsSchema.parse(data);

  // Upsert settings (create if not exists, update if exists)
  const settings = await db.organizationSettings.upsert({
    where: { clerkOrgId: orgId },
    update: validated,
    create: {
      clerkOrgId: orgId,
      ...validated,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, settings };
}

/**
 * Get default percentages for new contractors/estimators
 * Can be called by admin/manager when creating new records
 */
export async function getDefaultPercentages() {
  await requireRole(["admin", "manager"]);

  const orgId = await getCurrentOrgId();

  if (!orgId) {
    return {
      defaultBillingPct: 0.125,
      defaultCommissionPct: 0.05,
    };
  }

  const settings = await db.organizationSettings.findUnique({
    where: { clerkOrgId: orgId },
    select: {
      defaultBillingPct: true,
      defaultCommissionPct: true,
    },
  });

  if (!settings) {
    return {
      defaultBillingPct: 0.125,
      defaultCommissionPct: 0.05,
    };
  }

  return {
    defaultBillingPct: settings.defaultBillingPct.toNumber(),
    defaultCommissionPct: settings.defaultCommissionPct.toNumber(),
  };
}

/**
 * Get compliance hours setting
 */
export async function getComplianceHours(): Promise<number> {
  const orgId = await getCurrentOrgId();

  if (!orgId) {
    return 48; // Default
  }

  const settings = await db.organizationSettings.findUnique({
    where: { clerkOrgId: orgId },
    select: { complianceHours: true },
  });

  return settings?.complianceHours ?? 48;
}
