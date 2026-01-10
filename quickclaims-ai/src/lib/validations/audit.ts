import { z } from "zod";

/**
 * Valid audit action types
 */
export const auditActionEnum = z.enum([
  "create",
  "update",
  "delete",
  "status_change",
  "approve",
  "submit",
  "login",
]);

export type AuditAction = z.infer<typeof auditActionEnum>;

/**
 * Valid entity types that can be audited
 */
export const entityTypeEnum = z.enum([
  "claim",
  "supplement",
  "note",
  "document",
  "contractor",
  "estimator",
  "carrier",
  "adjuster",
  "user",
]);

export type EntityType = z.infer<typeof entityTypeEnum>;

/**
 * Audit log input schema (for creating entries)
 */
export const auditLogInputSchema = z.object({
  action: auditActionEnum,
  entityType: entityTypeEnum,
  entityId: z.string().min(1, "Entity ID is required"),
  fieldName: z.string().optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AuditLogInput = z.infer<typeof auditLogInputSchema>;

/**
 * Audit log filters schema (for querying)
 */
export const auditLogFiltersSchema = z.object({
  userId: z.string().optional(),
  action: auditActionEnum.optional(),
  entityType: entityTypeEnum.optional(),
  entityId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;
