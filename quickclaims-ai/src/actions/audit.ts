"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  auditLogFiltersSchema,
  type AuditLogInput,
  type AuditLogFilters,
  type AuditAction,
  type EntityType,
} from "@/lib/validations/audit";

/**
 * Log an audit entry - internal helper, called from other actions
 * This is NOT a server action meant to be called from the client
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    console.warn("Audit log attempted without authenticated user");
    return;
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "unknown";

  try {
    await db.auditLog.create({
      data: {
        userId,
        userEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        fieldName: input.fieldName ?? null,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
        metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Log multiple field changes for an entity update
 */
export async function logAuditChanges(
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  changes: Record<string, { old: unknown; new: unknown }>,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    console.warn("Audit log attempted without authenticated user");
    return;
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "unknown";

  try {
    // Create audit entries for each changed field
    const entries = Object.entries(changes).map(([fieldName, { old, new: newVal }]) => ({
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      fieldName,
      oldValue: old !== undefined ? String(old) : null,
      newValue: newVal !== undefined ? String(newVal) : null,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    }));

    if (entries.length > 0) {
      await db.auditLog.createMany({ data: entries });
    }
  } catch (error) {
    console.error("Failed to create audit logs:", error);
  }
}

/**
 * Get audit logs with filters - admin only
 */
export async function getAuditLogs(filters?: Partial<AuditLogFilters>) {
  await requireRole(["admin"]);

  const validated = auditLogFiltersSchema.parse(filters ?? {});
  const { userId, action, entityType, entityId, dateFrom, dateTo, page, limit } = validated;

  const where: Record<string, unknown> = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entityType = entityType;
  }

  if (entityId) {
    where.entityId = entityId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      (where.createdAt as Record<string, Date>).gte = dateFrom;
    }
    if (dateTo) {
      (where.createdAt as Record<string, Date>).lte = dateTo;
    }
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(entityType: EntityType, entityId: string) {
  await requireRole(["admin", "manager"]);

  const logs = await db.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs;
}

/**
 * Get unique users who have audit logs (for filter dropdown)
 */
export async function getAuditLogUsers() {
  await requireRole(["admin"]);

  const users = await db.auditLog.findMany({
    distinct: ["userId", "userEmail"],
    select: {
      userId: true,
      userEmail: true,
    },
    orderBy: { userEmail: "asc" },
  });

  return users;
}
