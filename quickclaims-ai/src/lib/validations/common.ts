import { z } from "zod";

/**
 * Common validation schemas used across the application
 */

// Phone number (US format)
export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s\-().+]*$/,
    "Phone number can only contain digits, spaces, dashes, parentheses, and +"
  )
  .optional()
  .or(z.literal(""));

// US State (2-letter code)
export const stateSchema = z
  .string()
  .length(2, "State must be 2-letter code")
  .toUpperCase();

// US ZIP code
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format");

// Currency amount
export const currencySchema = z.coerce
  .number()
  .nonnegative("Amount cannot be negative");

// Percentage (as decimal)
export const percentageSchema = z.coerce
  .number()
  .min(0, "Percentage cannot be negative")
  .max(1, "Percentage cannot exceed 100%");

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

// ID parameter
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Date range
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;
