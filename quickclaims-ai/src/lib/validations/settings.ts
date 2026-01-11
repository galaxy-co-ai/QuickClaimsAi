import { z } from "zod";

/**
 * Settings validation schemas
 */

// ============================================================================
// USER PREFERENCES
// ============================================================================

export const userPreferencesSchema = z.object({
  // Notification Preferences
  emailStatusChanges: z.boolean().default(true),
  emailSupplements: z.boolean().default(true),
  email48HourReminders: z.boolean().default(true),
  emailWeeklySummary: z.boolean().default(false),

  // Appearance Preferences
  theme: z.enum(["light", "dark", "system"]).default("system"),
  sidebarCollapsed: z.boolean().default(false),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),
  claimsPerPage: z.number().int().min(10).max(100).default(20),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

export const updateUserPreferencesSchema = userPreferencesSchema.partial();

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

export const organizationSettingsSchema = z.object({
  // Company Information
  companyName: z.string().max(200).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryContactEmail: z.string().email().optional().or(z.literal("")),
  businessAddress: z.string().max(500).optional(),

  // Default Percentages
  defaultBillingPct: z.number().min(0.05).max(0.30).default(0.125), // 5-30%
  defaultCommissionPct: z.number().min(0.01).max(0.15).default(0.05), // 1-15%

  // Compliance Settings
  complianceHours: z.number().int().min(12).max(168).default(48), // 12h to 1 week

  // Report Customization
  reportHeader: z.string().max(1000).optional(),
  reportFooter: z.string().max(1000).optional(),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;

export const updateOrganizationSettingsSchema = organizationSettingsSchema.partial();

export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;

// ============================================================================
// THEME TYPE
// ============================================================================

export type ThemeValue = "light" | "dark" | "system";
export type DateFormatValue = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
