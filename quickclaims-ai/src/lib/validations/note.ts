import { z } from "zod";

/**
 * Note types enum
 * - general: General notes
 * - status_change: Auto-generated status change notes
 * - call: Phone call notes
 * - email: Email correspondence notes  
 * - document: Document-related notes
 */
export const noteTypeSchema = z.enum(["general", "status_change", "call", "email", "document"]);

export type NoteTypeEnum = z.infer<typeof noteTypeSchema>;

/**
 * Note input validation schema
 */
export const noteInputSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  content: z.string().min(1, "Note content is required").max(10000, "Note is too long"),
  type: noteTypeSchema.default("general"),
  isInternal: z.boolean().default(false),
});

export type NoteInput = z.infer<typeof noteInputSchema>;

/**
 * Note update validation schema
 */
export const noteUpdateSchema = z.object({
  content: z.string().min(1, "Note content is required").max(10000, "Note is too long").optional(),
  isInternal: z.boolean().optional(),
});

export type NoteUpdate = z.infer<typeof noteUpdateSchema>;
