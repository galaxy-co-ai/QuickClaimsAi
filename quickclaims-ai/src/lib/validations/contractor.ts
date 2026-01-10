import { z } from "zod";

/**
 * Contractor validation schemas
 */

export const contractorInputSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long"),
  contactName: z.string().max(100).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().max(500).optional(),
  billingPercentage: z.coerce
    .number()
    .min(0.05, "Billing percentage must be at least 5%")
    .max(0.2, "Billing percentage cannot exceed 20%"),
  paymentTerms: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export type ContractorInput = z.infer<typeof contractorInputSchema>;
