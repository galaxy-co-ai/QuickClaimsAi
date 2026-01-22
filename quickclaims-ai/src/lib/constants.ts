/**
 * QuickClaims AI - Application Constants
 */

import type { ClaimStatus } from "@prisma/client";

// Claim status labels for UI
export const CLAIM_STATUS_LABELS: Record<string, string> = {
  missing_info: "Missing Info To Start",
  contractor_review: "Contractor Review",
  supplement_sent: "Supplement Sent to Insurance",
  supplement_received: "Supplement Received by Insurance",
  counterargument_submitted: "Submitted Counterargument",
  escalated: "Escalated Claim",
  contractor_advance: "Contractor Required to Advance",
  waiting_on_build: "Waiting On Build",
  line_items_confirmed: "Confirm Line Items Completed",
  rebuttal_posted: "Rebuttal Carrier Post",
  final_invoice_sent: "Final Invoice Sent to Carrier",
  final_invoice_received: "Final Invoice Received by Carrier",
  money_released: "Money Released to Homeowner",
  work_suspended: "Work Suspended",
  completed: "Completed",
};

// Status colors for badges (using design system tokens)
export const CLAIM_STATUS_COLORS: Record<string, string> = {
  missing_info: "bg-[var(--rr-color-warning)]/10 text-[var(--rr-color-warning)]",
  contractor_review: "bg-[var(--rr-color-brand-accent)]/10 text-[var(--rr-color-brand-accent)]",
  supplement_sent: "bg-[var(--rr-color-info)]/10 text-[var(--rr-color-info)]",
  supplement_received: "bg-[var(--rr-color-info)]/15 text-[var(--rr-color-info)]",
  counterargument_submitted: "bg-[var(--rr-color-brand-accent)]/15 text-[var(--rr-color-brand-accent)]",
  escalated: "bg-[var(--rr-color-error)]/10 text-[var(--rr-color-error)]",
  contractor_advance: "bg-[var(--rr-color-warning)]/15 text-[var(--rr-color-warning)]",
  waiting_on_build: "bg-[var(--rr-color-info)]/20 text-[var(--rr-color-info)]",
  line_items_confirmed: "bg-[var(--rr-color-success)]/10 text-[var(--rr-color-success)]",
  rebuttal_posted: "bg-[var(--rr-color-brand-accent)]/20 text-[var(--rr-color-brand-accent)]",
  final_invoice_sent: "bg-[var(--rr-color-info)]/25 text-[var(--rr-color-info)]",
  final_invoice_received: "bg-[var(--rr-color-success)]/15 text-[var(--rr-color-success)]",
  money_released: "bg-[var(--rr-color-success)]/20 text-[var(--rr-color-success)]",
  work_suspended: "bg-[var(--rr-color-stone)]/10 text-[var(--rr-color-stone)]",
  completed: "bg-[var(--rr-color-success)]/25 text-[var(--rr-color-success)]",
};

// Valid status transitions (from -> to[]) - allowing flexible transitions
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  missing_info: ["contractor_review", "work_suspended"],
  contractor_review: ["supplement_sent", "missing_info", "work_suspended"],
  supplement_sent: ["supplement_received", "work_suspended"],
  supplement_received: ["counterargument_submitted", "contractor_advance", "waiting_on_build", "work_suspended"],
  counterargument_submitted: ["escalated", "supplement_received", "rebuttal_posted", "work_suspended"],
  escalated: ["supplement_received", "rebuttal_posted", "work_suspended"],
  contractor_advance: ["waiting_on_build", "work_suspended"],
  waiting_on_build: ["line_items_confirmed", "work_suspended"],
  line_items_confirmed: ["final_invoice_sent", "work_suspended"],
  rebuttal_posted: ["supplement_received", "final_invoice_sent", "work_suspended"],
  final_invoice_sent: ["final_invoice_received", "work_suspended"],
  final_invoice_received: ["money_released", "work_suspended"],
  money_released: ["completed"],
  work_suspended: ["missing_info", "contractor_review"], // Can resume from suspended
  completed: [], // Terminal state
};

// Document type labels
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  insurance_scope: "Insurance Scope",
  signed_agreement: "Signed Agreement",
  measurement_report: "Measurement Report",
  photo_inspection: "Inspection Photos",
  supplement_estimate: "Supplement Estimate",
  material_invoice: "Material Invoice",
  final_invoice: "Final Invoice",
  carrier_correspondence: "Carrier Correspondence",
  other: "Other",
};

// Loss type labels
export const LOSS_TYPE_LABELS: Record<string, string> = {
  hail: "Hail",
  wind: "Wind",
  fire: "Fire",
  other: "Other",
};

// Job type labels
export const JOB_TYPE_LABELS: Record<string, string> = {
  supplement: "Supplement",
  reinspection: "Reinspection",
  estimate: "Estimate Only",
  final_invoice: "Final Invoice",
};

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

// US States
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

// Default billing percentages
export const DEFAULT_CONTRACTOR_BILLING_PERCENTAGE = 0.125; // 12.5%
export const DEFAULT_ESTIMATOR_COMMISSION_PERCENTAGE = 0.05; // 5%

// 48-hour compliance thresholds (in hours)
export const COMPLIANCE_WARNING_HOURS = 36;
export const COMPLIANCE_OVERDUE_HOURS = 48;

// Status transition helper functions

/**
 * Get valid next statuses for a claim
 */
export function getValidNextStatuses(currentStatus: ClaimStatus): ClaimStatus[] {
  return (STATUS_TRANSITIONS[currentStatus] || []) as ClaimStatus[];
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: ClaimStatus,
  newStatus: ClaimStatus
): boolean {
  const validTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
}
