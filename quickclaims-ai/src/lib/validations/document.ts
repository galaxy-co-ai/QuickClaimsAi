import { z } from "zod";

/**
 * Document validation schemas
 */

export const documentTypeSchema = z.enum([
  "insurance_scope",
  "signed_agreement",
  "measurement_report",
  "photo_inspection",
  "supplement_estimate",
  "material_invoice",
  "final_invoice",
  "carrier_correspondence",
  "other",
]);

export type DocumentTypeValue = z.infer<typeof documentTypeSchema>;

export const documentUploadSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  type: documentTypeSchema,
  description: z.string().optional(),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/msword", // .doc
  "application/vnd.ms-excel", // .xls
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
