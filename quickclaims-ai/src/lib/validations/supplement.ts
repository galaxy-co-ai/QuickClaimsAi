import { z } from "zod";

/**
 * Supplement validation schemas
 */

export const supplementInputSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
        total: z.number(),
        buildingCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export type SupplementInput = z.infer<typeof supplementInputSchema>;

export const supplementStatusSchema = z.enum([
  "draft",
  "submitted",
  "pending",
  "approved",
  "denied",
  "partial",
]);

export type SupplementStatusType = z.infer<typeof supplementStatusSchema>;

export const supplementApprovalSchema = z.object({
  supplementId: z.string().min(1),
  status: z.enum(["approved", "denied", "partial"]),
  approvedAmount: z.coerce.number().nonnegative().optional(),
});

export type SupplementApproval = z.infer<typeof supplementApprovalSchema>;
