import { z } from "zod";

/**
 * Claim validation schemas
 */

export const claimInputSchema = z.object({
  policyholderName: z
    .string()
    .min(1, "Policyholder name is required")
    .max(200, "Name too long"),
  policyholderEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  policyholderPhone: z.string().optional(),
  lossAddress: z.string().min(1, "Address is required").max(200),
  lossCity: z.string().min(1, "City is required").max(100),
  lossState: z
    .string()
    .length(2, "State must be 2-letter code")
    .toUpperCase(),
  lossZip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  claimNumber: z.string().max(50).optional(),
  dateOfLoss: z.date().optional(),
  lossType: z.enum(["hail", "wind", "fire", "other"]).optional(),
  contractorId: z.string().min(1, "Contractor is required"),
  estimatorId: z.string().min(1, "Estimator is required"),
  carrierId: z.string().min(1, "Carrier is required"),
  adjusterId: z.string().optional(),
  jobType: z.enum(["supplement", "reinspection", "estimate", "final_invoice"]),
  totalSquares: z.number().positive("Total squares must be positive"),
  roofRCV: z.number().nonnegative("Roof RCV cannot be negative"),
  initialRCV: z.number().nonnegative("Initial RCV cannot be negative"),
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
