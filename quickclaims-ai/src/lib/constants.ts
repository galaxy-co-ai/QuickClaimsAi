/**
 * QuickClaims AI - Application Constants
 */

// Claim status labels for UI
export const CLAIM_STATUS_LABELS: Record<string, string> = {
  new_supplement: "New Supplement",
  missing_info: "Missing Info",
  contractor_review: "Contractor Review",
  supplement_in_progress: "In Progress",
  supplement_sent: "Sent to Carrier",
  awaiting_carrier_response: "Awaiting Response",
  reinspection_requested: "Reinspection Requested",
  reinspection_scheduled: "Reinspection Scheduled",
  approved: "Approved",
  final_invoice_pending: "Final Invoice Pending",
  final_invoice_sent: "Final Invoice Sent",
  completed: "Completed",
  closed_lost: "Closed - Lost",
};

// Status colors for badges
export const CLAIM_STATUS_COLORS: Record<string, string> = {
  new_supplement: "bg-blue-100 text-blue-800",
  missing_info: "bg-yellow-100 text-yellow-800",
  contractor_review: "bg-purple-100 text-purple-800",
  supplement_in_progress: "bg-indigo-100 text-indigo-800",
  supplement_sent: "bg-cyan-100 text-cyan-800",
  awaiting_carrier_response: "bg-orange-100 text-orange-800",
  reinspection_requested: "bg-amber-100 text-amber-800",
  reinspection_scheduled: "bg-lime-100 text-lime-800",
  approved: "bg-green-100 text-green-800",
  final_invoice_pending: "bg-teal-100 text-teal-800",
  final_invoice_sent: "bg-emerald-100 text-emerald-800",
  completed: "bg-green-200 text-green-900",
  closed_lost: "bg-red-100 text-red-800",
};

// Valid status transitions (from -> to[])
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  new_supplement: ["missing_info", "supplement_in_progress"],
  missing_info: ["new_supplement", "supplement_in_progress"],
  supplement_in_progress: ["contractor_review", "supplement_sent"],
  contractor_review: ["supplement_sent", "supplement_in_progress"],
  supplement_sent: ["awaiting_carrier_response"],
  awaiting_carrier_response: [
    "reinspection_requested",
    "approved",
    "closed_lost",
  ],
  reinspection_requested: ["reinspection_scheduled"],
  reinspection_scheduled: ["approved", "awaiting_carrier_response"],
  approved: ["final_invoice_pending"],
  final_invoice_pending: ["final_invoice_sent"],
  final_invoice_sent: ["completed"],
  completed: [], // Terminal state
  closed_lost: [], // Terminal state
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
