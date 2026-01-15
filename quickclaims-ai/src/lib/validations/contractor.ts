import { z } from "zod";

/**
 * Contractor validation schemas
 */

// Shared rate validation (optional, 0-100% stored as decimal 0.00-1.00)
const rateSchema = z
  .number()
  .min(0, "Rate must be at least 0%")
  .max(0.5, "Rate cannot exceed 50%")
  .optional();

// Flat fee validation (optional, positive dollar amount)
const flatFeeSchema = z
  .number()
  .min(0, "Fee must be positive")
  .max(10000, "Fee cannot exceed $10,000")
  .optional();

export const contractorInputSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long"),
  contactName: z.string().max(100).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().max(500).optional(),
  
  // Legacy/default billing percentage (required for backwards compatibility)
  billingPercentage: z
    .number()
    .min(0.05, "Billing percentage must be at least 5%")
    .max(0.3, "Billing percentage cannot exceed 30%"),
  
  // Rate fields by job type
  residentialRate: rateSchema,
  commercialRate: rateSchema,
  reinspectionRate: rateSchema,
  estimateFlatFee: flatFeeSchema,
  
  paymentTerms: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export type ContractorInput = z.infer<typeof contractorInputSchema>;
