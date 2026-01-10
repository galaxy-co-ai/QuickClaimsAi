import { z } from "zod";

/**
 * Adjuster validation schemas
 */

export const adjusterInputSchema = z.object({
  name: z
    .string()
    .min(1, "Adjuster name is required")
    .max(200, "Name too long"),
  carrierId: z.string().min(1, "Carrier is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["desk", "field", "independent"]),
});

export type AdjusterInput = z.infer<typeof adjusterInputSchema>;

export const adjusterFiltersSchema = z.object({
  carrierId: z.string().optional(),
  type: z.enum(["desk", "field", "independent"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type AdjusterFilters = z.infer<typeof adjusterFiltersSchema>;
