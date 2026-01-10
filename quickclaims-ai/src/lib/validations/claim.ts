import { z } from "zod";

/**
 * Claim validation schemas
 */

export const claimInputSchema = z.object({
  // Policyholder Info
  policyholderName: z
    .string()
    .min(1, "Policyholder name is required")
    .max(200, "Name too long"),
  policyholderEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  policyholderPhone: z.string().optional(),
  policyholderWorkPhone: z.string().optional(),
  policyholderFax: z.string().optional(),

  // Address
  lossAddress: z.string().min(1, "Address is required").max(200),
  lossAddressLine2: z.string().max(200).optional(),
  lossCity: z.string().min(1, "City is required").max(100),
  lossState: z
    .string()
    .length(2, "State must be 2-letter code")
    .toUpperCase(),
  lossZip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),

  // Claim Info
  claimNumber: z.string().max(50).optional(),
  policyNumber: z.string().max(50).optional(),
  dateOfLoss: z.date().optional(),
  lossType: z.enum(["hail", "wind", "fire", "other"]).optional(),

  // Relationships
  contractorId: z.string().min(1, "Contractor is required"),
  estimatorId: z.string().min(1, "Estimator is required"),
  carrierId: z.string().min(1, "Carrier is required"),
  adjusterId: z.string().optional(),

  // Direct Adjuster Info (for when adjuster not in system)
  adjusterNameOverride: z.string().max(200).optional(),
  adjusterPhoneOverride: z.string().optional(),
  adjusterEmailOverride: z.string().email("Invalid email").optional().or(z.literal("")),

  // Supervisor Info
  supervisorName: z.string().max(200).optional(),
  supervisorPhone: z.string().optional(),

  // External References
  contractorCrmId: z.string().max(100).optional(),
  externalJobNumber: z.string().max(100).optional(),

  // Job Type
  jobType: z.enum(["supplement", "reinspection", "estimate", "final_invoice"]),

  // Financial - Initial (required on creation)
  totalSquares: z.number().positive("Total squares must be positive"),
  roofRCV: z.number().nonnegative("Roof RCV cannot be negative"),
  initialRCV: z.number().nonnegative("Initial RCV cannot be negative"),

  // Financial - Final (updated as claim progresses)
  finalRoofRCV: z.number().nonnegative().optional(),
  finalTotalRCV: z.number().nonnegative().optional(),

  // Money Released
  moneyReleasedAmount: z.number().nonnegative().optional(),
});

export type ClaimInput = z.infer<typeof claimInputSchema>;

export const claimFiltersSchema = z.object({
  status: z.string().optional(),
  contractorId: z.string().optional(),
  estimatorId: z.string().optional(),
  carrierId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ClaimFilters = z.infer<typeof claimFiltersSchema>;

export const claimStatusSchema = z.enum([
  "new_supplement",
  "missing_info",
  "contractor_review",
  "supplement_in_progress",
  "supplement_sent",
  "awaiting_carrier_response",
  "reinspection_requested",
  "reinspection_scheduled",
  "approved",
  "final_invoice_pending",
  "final_invoice_sent",
  "completed",
  "closed_lost",
]);

export type ClaimStatusType = z.infer<typeof claimStatusSchema>;
