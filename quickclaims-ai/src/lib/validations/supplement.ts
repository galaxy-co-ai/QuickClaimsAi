import { z } from "zod";

/**
 * Supplement validation schemas
 */

export const supplementInputSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Line items description is required"),
  omApproved: z.boolean().default(false), // Was O&P (Overhead & Profit) approved
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
  // Roof squares (for reinspection detection)
  previousRoofSquares: z.coerce.number().nonnegative().optional(),
  newRoofSquares: z.coerce.number().nonnegative().optional(),
  // Roof RCV fields
  previousRoofRCV: z.coerce.number().nonnegative().optional(),
  newRoofRCV: z.coerce.number().nonnegative().optional(),
  // Increase breakdown for price per square calculation
  roofingIncrease: z.coerce.number().nonnegative().optional(),
  nonRoofingIncrease: z.coerce.number().nonnegative().optional(),
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
